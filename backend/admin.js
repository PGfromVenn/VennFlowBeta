const fs = require('fs');
const path = require('path');
function updateEnvAuthCode(newCode) {
  const envPath = path.join(__dirname, '../.env');
  let content = fs.readFileSync(envPath, 'utf-8');
  content = content.replace(/(INCONTROL_AUTH_CODE=).*/, `$1${newCode}`);
  fs.writeFileSync(envPath, content, 'utf-8');
}
// Exemple d'utilisation :
// updateEnvAuthCode('NOUVEAU_CODE');


// Ajoute dans la route qui gère le refresh du code :
// (Déplacé après l'initialisation de app)
const express = require('express');
require('dotenv').config();
const { loadToken, saveToken } = require('./services/tokenStore');
const { exec } = require('child_process');

const app = express();
const PORT = 4000;
app.use(express.json());

// Route pour rafraîchir le code InControl
app.post('/refresh-incontrol-code', (req, res) => {
  const { newCode } = req.body;
  if (!newCode) return res.status(400).send('Missing newCode');
  updateEnvAuthCode(newCode);
  res.send('INCONTROL_AUTH_CODE updated');
});

// Main management page
app.get('/', async (req, res) => {
  const tokenData = loadToken() || {};
  let envContent = '';
  let tokenFileContent = '';
  let logsContent = '';
let tempAuthCode = null;
  try { envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8'); } catch {}
  try { tokenFileContent = fs.readFileSync(path.join(__dirname, 'services/incontrol_token.json'), 'utf8'); } catch {}
  try { logsContent = fs.readFileSync(path.join(__dirname, '../backend.log'), 'utf8'); } catch {}
  res.send(`
    <html>
      <head><title>Backend Management</title></head>
      <body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h1>Backend Management</h1>
        <h2>Credentials (.env)</h2>
        <pre>${JSON.stringify({
          INCONTROL_CLIENT_ID: process.env.INCONTROL_CLIENT_ID,
          INCONTROL_CLIENT_SECRET: process.env.INCONTROL_CLIENT_SECRET,
          INCONTROL_AUTH_CODE: process.env.INCONTROL_AUTH_CODE,
          INCONTROL_ORG_ID: process.env.INCONTROL_ORG_ID,
          INCONTROL_REDIRECT_URI: process.env.INCONTROL_REDIRECT_URI,
          MONGODB_URI: process.env.MONGODB_URI
        }, null, 2)}</pre>
        <h2>Current Token (parsed)</h2>
        <pre>${JSON.stringify(tokenData, null, 2)}</pre>
        <form method="POST" action="/reset-token">
          <button type="submit" style="padding:10px 20px;font-size:1em;">Reset Token</button>
        </form>
        <form method="GET" action="https://incontrol.venn.be/login/oauth_permission">
          <input type="hidden" name="client_id" value="9819e24f0307538050836bd09412242c" />
          <input type="hidden" name="redirect_uri" value="http://localhost:4000/oauth-callback" />
          <input type="hidden" name="response_type" value="code" />
          <button type="submit" style="padding:10px 20px;font-size:1em;background:#ffd600;color:#222;">Demander un nouveau token InControl2</button>
        </form>
        <form method="POST" action="/restart-backend">
          <button type="submit" style="padding:10px 20px;font-size:1em;background:#1976d2;color:#fff;">Redémarrer Backend</button>
        </form>
        <form method="POST" action="/restart-frontend">
          <button type="submit" style="padding:10px 20px;font-size:1em;background:#43a047;color:#fff;">Redémarrer Frontend Portail</button>
        </form>
        <form method="POST" action="/restart-management">
          <button type="submit" style="padding:10px 20px;font-size:1em;background:#ffa000;color:#fff;">Redémarrer Backend Management</button>
        </form>
        <hr/>
        <h2>Login InControl2 (manuel)</h2>
        <form method="POST" action="/login-incontrol">
          <label>Email: <input type="email" name="email" required style="margin-right:10px;" /></label>
          <label>Mot de passe: <input type="password" name="password" required style="margin-right:10px;" /></label>
          <button type="submit" style="padding:10px 20px;font-size:1em;background:#e53935;color:#fff;">Login &amp; Récupérer Token</button>
        </form>
        <h2>Deep Debug</h2>
        <h3>.env file</h3>
        <pre>${envContent}</pre>
        <h3>incontrol_token.json (raw)</h3>
        <pre>${tokenFileContent}</pre>
        <h3>backend.log (last 1000 chars)</h3>
        <pre>${logsContent ? logsContent.slice(-1000) : ''}</pre>
      </body>
    </html>
  `);
});

// OAuth2 callback
app.get('/oauth-callback', async (req, res) => {
  const code = req.query.code;
  tempAuthCode = code || null;
  res.send(`
    <html>
      <body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h1>Code d'autorisation reçu</h1>
        <p>Copiez ce code et mettez-le dans votre .env ou utilisez-le pour générer un token :</p>
        <pre style="font-size:1.2em;background:#eee;padding:10px;">${code || 'Aucun code reçu'}</pre>
        <form method="POST" action="/exchange-token">
          <button type="submit" style="padding:10px 20px;font-size:1em;background:#43a047;color:#fff;">Échanger ce code contre un token</button>
        </form>
        <a href="/">Retour à la gestion backend</a>
      </body>
    </html>
  `);
// Route pour échanger le code d'autorisation temporaire contre un token
app.post('/exchange-token', async (req, res) => {
  if (!tempAuthCode) {
    return res.send(`<html><body><h2>Aucun code d'autorisation temporaire en mémoire</h2><a href="/">Retour</a></body></html>`);
  }
  const BASE_URL = "https://incontrol.venn.be";
  const CLIENT_ID = process.env.INCONTROL_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.INCONTROL_CLIENT_SECRET || "";
  const REDIRECT_URI = process.env.INCONTROL_REDIRECT_URI || "http://localhost:4000/oauth-callback";
  const tokenUrl = `${BASE_URL}/api/oauth2/token`;
  try {
    const axios = require('axios');
    const qs = require('querystring');
    const params = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code: tempAuthCode
    };
    const response = await axios.post(tokenUrl, qs.stringify(params), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    // Stocke le token dans le fichier et affiche le résultat
    saveToken(response.data);
    // Met à jour le .env avec le nouveau access_token
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    try { envContent = fs.readFileSync(envPath, 'utf8'); } catch {}
    let newEnvContent = '';
    if (response.data.access_token) {
      // Remplace ou ajoute la clé INCONTROL_ACCESS_TOKEN
      if (envContent.match(/^INCONTROL_ACCESS_TOKEN=.*$/m)) {
        newEnvContent = envContent.replace(/^INCONTROL_ACCESS_TOKEN=.*$/m, `INCONTROL_ACCESS_TOKEN=${response.data.access_token}`);
      } else {
        newEnvContent = envContent + `\nINCONTROL_ACCESS_TOKEN=${response.data.access_token}`;
      }
      fs.writeFileSync(envPath, newEnvContent, 'utf8');
    }
    tempAuthCode = null;
    res.send(`
      <html><body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h1>Token généré et stocké !</h1>
        <pre style="font-size:1.2em;background:#eee;padding:10px;">${JSON.stringify(response.data, null, 2)}</pre>
        <p>.env mis à jour avec INCONTROL_ACCESS_TOKEN</p>
        <a href="/">Retour à la gestion backend</a>
      </body></html>
    `);
  } catch (err) {
    res.send(`
      <html><body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h2>Erreur lors de l'échange du code : ${err.message}</h2>
        <a href="/">Retour</a>
      </body></html>
    `);
  }
});
});

// Manual login
app.post('/login-incontrol', express.urlencoded({ extended: true }), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send(`
      <html><body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h2>Email et mot de passe requis</h2>
        <a href="/">Retour</a>
      </body></html>
    `);
  }
  try {
    const axios = require('axios');
    // Remplace l’URL et le body selon la doc InControl2
    const response = await axios.post('https://incontrol.venn.be/api/login', {
      email,
      password
    });
    const token = response.data.access_token;
    res.send(`
      <html><body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h1>Token reçu</h1>
        <pre style="font-size:1.2em;background:#eee;padding:10px;">${token}</pre>
        <p>Copie ce token dans ton fichier .env ou utilise-le pour tes appels API.</p>
        <a href="/">Retour à la gestion backend</a>
      </body></html>
    `);
  } catch (err) {
    res.send(`
      <html><body style="font-family:sans-serif;max-width:800px;margin:auto;">
        <h2>Login échoué: ${err.message}</h2>
        <a href="/">Retour</a>
      </body></html>
    `);
  }
});

// Restart backend
app.post('/restart-backend', (req, res) => {
  exec('powershell.exe -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process"', (err) => {
    if (err) {
      return res.send(`<html><body><h2>Erreur lors du kill backend: ${err.message}</h2><a href="/">Retour</a></body></html>`);
    }
    exec('start powershell.exe -Command "cd ../backend; npm start"', (err2) => {
      if (err2) {
        return res.send(`<html><body><h2>Erreur lors du démarrage backend: ${err2.message}</h2><a href="/">Retour</a></body></html>`);
      }
      res.send(`<html><body><h2>Backend redémarré</h2><a href="/">Retour</a></body></html>`);
    });
  });
});

// Restart frontend
app.post('/restart-frontend', (req, res) => {
  exec('powershell.exe -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process"', (err) => {
    if (err) {
      return res.send(`<html><body><h2>Erreur lors du kill frontend: ${err.message}</h2><a href="/">Retour</a></body></html>`);
    }
    exec('start powershell.exe -Command "cd ../frontend; npm start"', (err2) => {
      if (err2) {
        return res.send(`<html><body><h2>Erreur lors du démarrage frontend: ${err2.message}</h2><a href="/">Retour</a></body></html>`);
      }
      res.send(`<html><body><h2>Frontend portail redémarré</h2><a href="/">Retour</a></body></html>`);
    });
  });
});

// Restart management
app.post('/restart-management', (req, res) => {
  exec('powershell.exe -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process"', (err) => {
    if (err) {
      return res.send(`<html><body><h2>Erreur lors du kill backend management: ${err.message}</h2><a href="/">Retour</a></body></html>`);
    }
    exec('start powershell.exe -Command "cd ../backend; node admin.js"', (err2) => {
      if (err2) {
        return res.send(`<html><body><h2>Erreur lors du démarrage backend management: ${err2.message}</h2><a href="/">Retour</a></body></html>`);
      }
      res.send(`<html><body><h2>Backend management redémarré</h2><a href="/">Retour</a></body></html>`);
    });
  });
});

// Reset token
app.post('/reset-token', (req, res) => {
  const tokenPath = path.join(__dirname, 'services/incontrol_token.json');
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
  }
  saveToken({});
  res.redirect('/');
});

// Test InControl2 token
app.get('/get-token', async (req, res) => {
  const BASE_URL = "https://incontrol.venn.be";
  const CLIENT_ID = "edd69ccfbd603fb7114e5b207fa82d10";
  const CLIENT_SECRET = process.env.INCONTROL_CLIENT_SECRET || "";
  const authUrl = `${BASE_URL}/auth.token.grant`;
  try {
    const axios = require('axios');
    const response = await axios.post(authUrl, {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    if (response.status === 200 && response.data.stat === "ok" && response.data.response) {
      res.json({ success: true, tokenData: response.data.response });
    } else {
      res.status(500).json({ error: "Unexpected API response", details: response.data });
    }
  } catch (err) {
    res.status(500).json({ error: "API call failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend management UI running on http://localhost:${PORT}`);
});