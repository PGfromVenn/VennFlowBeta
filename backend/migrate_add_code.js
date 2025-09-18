// Script de migration pour ajouter un code unique à chaque Vennbox existante
const mongoose = require('mongoose');
const Router = require('./models/router');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vennflow';

function generateVennboxCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  const vennboxes = await Router.find({ $or: [ { code: { $exists: false } }, { code: null } ] });
  for (const box of vennboxes) {
    let code, exists = true;
    while (exists) {
      code = generateVennboxCode();
      exists = await Router.findOne({ code });
    }
    box.code = code;
    await box.save();
    console.log(`Vennbox ${box.serial} migrée avec code ${code}`);
  }
  await mongoose.disconnect();
  console.log('Migration terminée.');
}

migrate().catch(e => { console.error(e); process.exit(1); });
