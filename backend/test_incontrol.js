const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Charge le token actuel
let tokenData = {};
try {
  tokenData = JSON.parse(fs.readFileSync(path.join(__dirname, 'services/incontrol_token.json'), 'utf8'));
} catch {}

const orgId = process.env.INCONTROL_ORG_ID;
const peplinkSerial = '293A-5291-D01F'; // à adapter si besoin
const accessToken = tokenData.access_token;

if (!orgId || !peplinkSerial || !accessToken) {
  console.error('Missing orgId, peplinkSerial, or accessToken');
  process.exit(1);
}

const url = `https://incontrol.venn.be/rest/o/${orgId}/sn/${peplinkSerial}`;

console.log('Testing InControl2 API call:');
console.log('URL:', url);
console.log('Authorization: Bearer', accessToken);

axios.get(url, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
}).then(res => {
  console.log('API Response:', JSON.stringify(res.data, null, 2));
}).catch(err => {
  if (err.response) {
    console.error('API Error:', err.response.status, err.response.data);
  } else {
    console.error('API Error:', err.message);
  }
});
