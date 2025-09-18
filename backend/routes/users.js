
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Endpoint pour éditer une Vennbox ou un device
router.post('/update-vennbox', async (req, res) => {
  const { vennboxId, update } = req.body;
  if (!vennboxId || !update) {
    return res.status(400).json({ error: 'vennboxId et update requis' });
  }
  try {
    const vennbox = await Router.findById(vennboxId);
    if (!vennbox) return res.status(404).json({ error: 'Vennbox non trouvée' });
    // Applique les updates à la racine, y compris routeur et LEO
    Object.keys(update).forEach(key => {
      vennbox[key] = update[key];
    });
    await vennbox.save();
    res.json({ success: true, vennbox });
  } catch (err) {
    console.error('Erreur update-vennbox:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour', details: err.message });
  }
});
// Endpoint pour récupérer toutes les Vennbox et leurs devices
router.get('/all-vennboxes', async (req, res) => {
  try {
  const vennboxes = await Router.find({});
  res.json({ vennboxes });
  } catch (err) {
    console.error('Erreur all-vennboxes:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des Vennbox', details: err.message });
  }
});
const { getBearerToken, getDeviceBySerial } = require('../services/incontrol2');
require('dotenv').config();
const Router = require('../models/router');
const { saveToken, loadToken } = require('../services/tokenStore');

// Force device logical status (English values)
router.post('/force-status', async (req, res) => {
  const { serial, statutLogique } = req.body;
  if (!serial || !statutLogique) {
    return res.status(400).json({ error: 'serial and statutLogique required' });
  }
  try {
    const routerDoc = await Router.findOne({ serial });
    if (!routerDoc) {
      return res.status(404).json({ error: 'Device not found' });
    }
    // Met à jour statutLogique au niveau de la Vennbox
    routerDoc.statutLogique = statutLogique;
    await routerDoc.save();
    res.json({ success: true, statutLogique });
  } catch (err) {
    console.error('Erreur force-status:', err);
    res.status(500).json({ error: 'Error updating device status', details: err.message });
  }
});

// Exemple d'utilisateurs (à remplacer par une base de données)
const users = [
  { id: 1, username: 'installateur', password: '$2a$10$hash', role: 'installateur' },
  { id: 2, username: 'operateur', password: '$2a$10$hash', role: 'operateur' },
  { id: 3, username: 'support', password: '$2a$10$hash', role: 'support' },
  { id: 4, username: 'client', password: '$2a$10$hash', role: 'client' },
  { id: 5, username: 'partenaire', password: '$2a$10$hash', role: 'partenaire' }
];

// Route de connexion
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });
  // Vérification du mot de passe (ici, hash fictif)
  const valid = true; // Remplacer par bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect' });
  // Génération du token JWT
  const token = jwt.sign({ id: user.id, role: user.role }, 'SECRET_KEY', { expiresIn: '1h' });
  res.json({ token, role: user.role });
});

// Middleware de vérification du token et du rôle
function authRole(role) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, 'SECRET_KEY', (err, user) => {
      if (err) return res.sendStatus(403);
      if (user.role !== role) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
}

// Exemple de route protégée par rôle
router.get('/installateur', authRole('installateur'), (req, res) => {
  res.json({ message: 'Bienvenue installateur' });
});

router.get('/operateur', authRole('operateur'), (req, res) => {
  res.json({ message: 'Bienvenue opérateur technique' });
});

router.get('/support', authRole('support'), (req, res) => {
  res.json({ message: 'Bienvenue support technique' });
});

router.get('/client', authRole('client'), (req, res) => {
  res.json({ message: 'Bienvenue client' });
});

router.get('/partenaire', authRole('partenaire'), (req, res) => {
  res.json({ message: 'Bienvenue partenaire' });
});


// Load tokens from disk on startup
let tokenDataMemory = loadToken() || {};
let accessTokenMemory = tokenDataMemory.access_token || null;
let refreshTokenMemory = tokenDataMemory.refresh_token || null;
let tokenExpiryMemory = tokenDataMemory.expiry || null;

router.get('/router-status', async function(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'code requis' });
  }
  try {
    // Cherche la Vennbox par code
    const router = await Router.findOne({ code });
    if (!router || !router.routeur || !router.routeur.serial) {
      return res.status(404).json({ error: 'Routeur ou sous-device non trouvé' });
    }
    // Utilise le serial du routeur principal
    const peplink = router.routeur;
    // Récupère l'authorization code et l'orgId depuis .env
    const orgId = process.env.INCONTROL_ORG_ID;
    const authCode = process.env.INCONTROL_AUTH_CODE;
    if (!orgId || !authCode) {
      return res.status(500).json({ error: 'INCONTROL_ORG_ID ou INCONTROL_AUTH_CODE manquant dans .env' });
    }

    // Gestion du token
    let accessToken = accessTokenMemory;
    let now = Date.now();
    if (!accessToken || (tokenExpiryMemory && now > tokenExpiryMemory)) {
      let tokenData;
      try {
        tokenData = await getBearerToken(authCode);
        accessToken = tokenData.access_token;
        accessTokenMemory = accessToken;
        refreshTokenMemory = tokenData.refresh_token;
        tokenExpiryMemory = now + ((tokenData.expires_in || 172799) * 1000) - 60000;
        saveToken({
          access_token: accessToken,
          refresh_token: refreshTokenMemory,
          expiry: tokenExpiryMemory
        });
      } catch (err) {
        if (err.response?.data?.error === 'code_already_used' && refreshTokenMemory) {
          try {
            tokenData = await require('../services/incontrol2').refreshBearerToken(refreshTokenMemory);
            accessToken = tokenData.access_token;
            accessTokenMemory = accessToken;
            refreshTokenMemory = tokenData.refresh_token;
            tokenExpiryMemory = now + ((tokenData.expires_in || 172799) * 1000) - 60000;
            saveToken({
              access_token: accessToken,
              refresh_token: refreshTokenMemory,
              expiry: tokenExpiryMemory
            });
          } catch (refreshErr) {
            return res.status(500).json({ error: 'Erreur refresh_token', details: refreshErr.message });
          }
        } else {
          return res.status(500).json({ error: 'Erreur InControl2', details: err.message });
        }
      }
    }

    // Interroge InControl2 avec le serial du routeur
    let ic2Data;
    try {
      ic2Data = await getDeviceBySerial(orgId, peplink.serial, accessToken);
    } catch (err) {
      if ((err.response?.status === 401 || err.response?.status === 403) && refreshTokenMemory) {
        try {
          const tokenData = await require('../services/incontrol2').refreshBearerToken(refreshTokenMemory);
          accessToken = tokenData.access_token;
          accessTokenMemory = accessToken;
          refreshTokenMemory = tokenData.refresh_token;
          tokenExpiryMemory = Date.now() + ((tokenData.expires_in || 172799) * 1000) - 60000;
          saveToken({
            access_token: accessToken,
            refresh_token: refreshTokenMemory,
            expiry: tokenExpiryMemory
          });
          ic2Data = await getDeviceBySerial(orgId, peplink.serial, accessToken);
        } catch (refreshErr) {
          return res.status(500).json({ error: 'Erreur refresh_token après access denied', details: refreshErr.message });
        }
      } else {
        return res.status(500).json({ error: 'Erreur InControl2', details: err.message });
      }
    }

    // Mapping vers le format frontend attendu
    const devices = [];
    if (ic2Data && ic2Data.data) {
      const d = ic2Data.data;
      const online = (d.status === 'online' || d.onlineStatus === 'ONLINE');
      let wanIp = null, wanConnected = false, wanDetails = null;
      let lanIp = null;
      if (Array.isArray(d.interfaces)) {
        const wanIface = d.interfaces.find(i => i.type === 'ethernet' || i.name === 'WAN');
        if (wanIface) {
          wanIp = wanIface.ip || null;
          wanConnected = wanIface.status === 'Connected';
          wanDetails = wanIface;
        }
      }
      let vlanIp = null;
      if (Array.isArray(d.interfaces)) {
        const vlanIface0 = d.interfaces.find(i => i.type === 'vlan' && i.index === 0);
        if (vlanIface0 && vlanIface0.ip) {
          vlanIp = vlanIface0.ip;
        }
      }
      let cellularConnected = false;
      if (Array.isArray(d.interfaces)) {
        const cellIface = d.interfaces.find(i => i.type === 'gobi' || i.virtualType === 'cellular');
        if (cellIface) {
          cellularConnected = cellIface.status === 'Connected';
        }
      }
  let statutLogique = router.statutLogique || '';
      devices.push({
        serial: peplink.serial,
        vennboxSerial: router.serial,
        online,
        statutLogique,
        wan: {
          ip: wanIp,
          connected: wanConnected,
          name: (Array.isArray(d.interfaces) ? (d.interfaces.find(i => i.type === 'ethernet' || i.name === 'WAN')?.name) : undefined),
          status: (Array.isArray(d.interfaces) ? (d.interfaces.find(i => i.type === 'ethernet' || i.name === 'WAN')?.status) : undefined),
          details: wanDetails,
        },
        lan: {
          ip: lanIp,
        },
        vlan_ip: vlanIp,
        cellular: {
          connected: cellularConnected,
          status: (Array.isArray(d.interfaces) ? (d.interfaces.find(i => i.type === 'gobi' || i.virtualType === 'cellular')?.status) : undefined),
        },
        latitude: d.latitude || null,
        longitude: d.longitude || null,
      });
    }
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: 'Erreur InControl2', details: err.message });
  }
});

// Activation code validation and status update
router.post('/activate-device', async (req, res) => {
  const { serial, activationCode } = req.body;
  if (!serial || !activationCode) {
    return res.status(400).json({ error: 'serial and activationCode required' });
  }
  // For this device, the code must be 'AAAAAA'
  if (activationCode !== 'AAAAAA') {
    return res.status(403).json({ error: 'Invalid activation code' });
  }
  try {
    const routerDoc = await Router.findOne({ serial });
    if (!routerDoc) {
      return res.status(404).json({ error: 'Device not found' });
    }
    // Set status to 'active' (add or update a 'statutLogique' field)
    if (!routerDoc.devices || !routerDoc.devices.length) {
      return res.status(404).json({ error: 'No sub-devices found' });
    }
    // Update statutLogique for the first device (or all if needed)
    routerDoc.devices.forEach(d => {
      d.statutLogique = 'active';
    });
    await routerDoc.save();
    res.json({ success: true, statutLogique: 'active' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating device status', details: err.message });
  }
});

// Endpoint to reset device status to 'To be deployed'
router.post('/reset-device-status', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ error: 'serial required' });
  }
  try {
    const routerDoc = await Router.findOne({ serial });
    if (!routerDoc) {
      return res.status(404).json({ error: 'Device not found' });
    }
    if (!routerDoc.devices || !routerDoc.devices.length) {
      return res.status(404).json({ error: 'No sub-devices found' });
    }
    routerDoc.devices.forEach(d => {
      d.statutLogique = 'To be deployed';
    });
    await routerDoc.save();
    res.json({ success: true, statutLogique: 'To be deployed' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting device status', details: err.message });
  }
});

// TEMP: Reset status for VBSMP00001 to 'To be deployed'
router.get('/force-reset-status', async (req, res) => {
  try {
    const routerDoc = await Router.findOne({ serial: 'VBSMP00001' });
    if (!routerDoc || !routerDoc.devices || !routerDoc.devices.length) {
      return res.status(404).json({ error: 'Device not found' });
    }
    routerDoc.devices[0].statutLogique = 'To be deployed';
    await routerDoc.save();
    res.json({ success: true, statutLogique: 'To be deployed' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting status', details: err.message });
  }
});

module.exports = router;
