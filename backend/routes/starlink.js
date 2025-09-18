// Route pour exposer le statut de la flotte Starlink
const express = require('express');
const router = express.Router();
const { getFleetStatus } = require('../../starlink-backend/starlinkFleet');

router.get('/starlink-fleet-status', async (req, res) => {
  try {
    const fleetStatus = await getFleetStatus();
    res.json({ starlink: fleetStatus });
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération statut Starlink', details: err.message });
  }
});

module.exports = router;
