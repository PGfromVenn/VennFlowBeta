// backend/models/router.js
const mongoose = require('mongoose');

const routerSchema = new mongoose.Schema({
  serial: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // code alphanumérique 12 caractères
  name: String,
  routeur: {
    supplier: { type: String, enum: ['Peplink', 'Teltonika'], required: false },
    serial: { type: String }
  },
  LEO: {
    supplier: { type: String, enum: ['Starlink', 'Kuiper'], required: false },
    serial: { type: String }
  },
  statutLogique: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Router', routerSchema);
