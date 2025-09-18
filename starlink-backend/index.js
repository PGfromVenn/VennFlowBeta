// starlink-backend/index.js
require('dotenv').config();
const express = require('express');
const app = express();
const { getStarlinkToken, getStarlinkTelemetry } = require('./starlink');
const { getFleetStatus } = require('./starlinkFleet');
// Route pour le statut agrégé du parc Starlink
app.get('/starlink/fleet', async (req, res) => {
  try {
    const status = await getFleetStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const { saveTelemetry, getTelemetry } = require('./db');
const port = process.env.PORT || 4100;

// Route pour démarrer l'auth Starlink (redirection vers l'URL d'autorisation)
app.get('/starlink/auth', (req, res) => {
  const clientId = process.env.STARLINK_CLIENT_ID;
  const redirectUri = encodeURIComponent("http://localhost:4100/oauth-callback");
  const authUrl = `https://www.starlink.com/api/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  res.redirect(authUrl);
});

// Route pour gérer le callback OAuth2 et échanger le code contre un token
app.get('/oauth-callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Code OAuth2 manquant');
  }
  try {
  const clientId = process.env.STARLINK_CLIENT_ID;
  const clientSecret = process.env.STARLINK_CLIENT_SECRET;
    const redirectUri = "http://localhost:4100/oauth-callback";
    const params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    };
    console.log('[Starlink][OAuth2] Tentative échange code:', params);
    try {
      const axios = require('axios');
      try {
        const tokenResponse = await axios.post(
          'https://www.starlink.com/api/auth/connect/token',
          new URLSearchParams(params),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            validateStatus: () => true // log même en cas d'erreur
          }
        );
        console.log('[Starlink][OAuth2] Status:', tokenResponse.status);
        console.log('[Starlink][OAuth2] Headers:', tokenResponse.headers);
        console.log('[Starlink][OAuth2] Data:', tokenResponse.data);
        res.status(tokenResponse.status).json(tokenResponse.data);
      } catch (err3) {
        console.error('[Starlink][OAuth2] Exception:', err3);
        res.status(500).json({ error: err3.message });
      }
    } catch (err2) {
      console.error('[Starlink][OAuth2] Erreur échange code:', err2.response?.data || err2.message);
      res.status(500).json({ error: err2.response?.data || err2.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour streamer la télémétrie en continu (poll toutes les 15s)
app.get('/starlink/telemetry/stream', async (req, res) => {
  const accountNumber = req.query.accountNumber ? req.query.accountNumber : "ACC-1447771-49930-21";
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  let stopped = false;
  req.on('close', () => { stopped = true; });
  async function pollTelemetry() {
    let attempt = 1;
    while (!stopped) {
      console.log(`[STREAM] Tentative #${attempt} de lecture de la télémétrie pour accountNumber=${accountNumber}`);
      try {
        const telemetry = await getStarlinkTelemetry(accountNumber);
        if (!telemetry || !telemetry.data || !telemetry.data.values || telemetry.data.values.length === 0) {
          console.log(`[STREAM] Aucune donnée de télémétrie à afficher (tentative #${attempt})`);
          res.write(JSON.stringify({ timestamp: new Date(), info: 'Aucune donnée de télémétrie à afficher.' }) + '\n');
        } else {
          console.log(`[STREAM] Télémétrie reçue (${telemetry.data.values.length} valeurs) (tentative #${attempt})`);
          await saveTelemetry(accountNumber, telemetry);
          res.write(JSON.stringify({ timestamp: new Date(), telemetry }) + '\n');
        }
      } catch (err) {
        console.log(`[STREAM] Erreur lors de la récupération de la télémétrie (tentative #${attempt}):`, err.message);
        res.write(JSON.stringify({ error: err.message }) + '\n');
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
    res.end();
  }
  pollTelemetry();
});

app.get('/', (req, res) => {
  res.send('Starlink backend is running. Use /starlink/token to get a token.');
});

// Route pour récupérer et stocker la télémétrie Starlink
app.get('/starlink/telemetry', async (req, res) => {
  const accountNumber = req.query.accountNumber ? req.query.accountNumber : "ACC-1447771-49930-21";
  try {
    const telemetry = await getStarlinkTelemetry(accountNumber);
    await saveTelemetry(accountNumber, telemetry);
    res.json(telemetry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour récupérer la télémétrie stockée
app.get('/starlink/telemetry/history', async (req, res) => {
  const accountNumber = req.query.accountNumber ? req.query.accountNumber : "ACC-1447771-49930-21";
  try {
    const history = await getTelemetry(accountNumber);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/starlink/token', async (req, res) => {
  try {
    const tokenData = await getStarlinkToken();
    res.json(tokenData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Starlink backend listening on port ${port}`);
});
