// Fonction pour interroger l'API télémétrie Starlink
async function getStarlinkTelemetry(accountNumber, batchSize = 1000, maxLingerMs = 15000) {
  let accessToken;
  try {
    accessToken = (await getStarlinkToken()).access_token || (await getStarlinkToken());
    console.log('[Starlink] Token utilisé pour la requête:', accessToken);
  } catch (err) {
    throw new Error('Impossible de récupérer le token Starlink');
  }
  try {
    const response = await axios.post(
      'https://web-api.starlink.com/telemetry/stream/v1/telemetry',
      {
        accountNumber,
        batchSize,
        maxLingerMs
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      }
    );
    // Enregistre chaque entrée de télémétrie dans Elasticsearch
    try {
      const { storeTelemetry } = require('./elasticsearch');
      if (Array.isArray(response.data)) {
        for (const entry of response.data) {
          await storeTelemetry(entry);
        }
      } else {
        await storeTelemetry(response.data);
      }
    } catch (esErr) {
      console.error('[Starlink] Erreur Elasticsearch:', esErr.message);
    }
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('[Starlink] Erreur API Starlink:', err.response.status, err.response.data);
      if (err.response.status === 403) {
        console.error('[Starlink] Token utilisé (403):', accessToken);
        console.error('[Starlink] Requête envoyée:', {
          accountNumber,
          batchSize,
          maxLingerMs
        });
      }
    } else {
      console.error('[Starlink] Erreur API Starlink (no response):', err.message);
    }
    // Si le token est expiré, on tente de le rafraîchir une fois
    if (err.response && err.response.status === 401) {
      try {
        accessToken = (await getStarlinkToken()).access_token || (await getStarlinkToken());
        console.log('[Starlink] Token rafraîchi:', accessToken);
        const response = await axios.post(
          'https://web-api.starlink.com/telemetry/stream/v1/telemetry',
          {
            accountNumber,
            batchSize,
            maxLingerMs
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': '*/*'
            }
          }
        );
        return response.data;
      } catch (err2) {
        console.error('[Starlink] Erreur après refresh token:', err2.response?.status, err2.response?.data);
        throw new Error('Erreur lors de la récupération des données de télémétrie Starlink après refresh token');
      }
    }
    throw err;
  }
}

module.exports = { getStarlinkToken, getStarlinkTelemetry };
// starlink-backend/starlink.js
// Module to connect to Starlink API and fetch data
require('dotenv').config();
const axios = require('axios');


// Mise à jour pour utiliser les nouveaux identifiants fournis
const CLIENT_ID = process.env.STARLINK_CLIENT_ID;
const CLIENT_SECRET = process.env.STARLINK_CLIENT_SECRET;

async function getStarlinkToken() {
  try {
    const response = await axios.post(
      'https://www.starlink.com/api/auth/connect/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching Starlink token:', err.response?.data || err.message);
    throw err;
  }
}

// ...existing code...
// Fusionne l'export pour inclure les deux fonctions
module.exports = { getStarlinkToken, getStarlinkTelemetry };
