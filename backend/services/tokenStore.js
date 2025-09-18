// backend/services/tokenStore.js
const fs = require('fs');
const path = require('path');
const TOKEN_PATH = path.join(__dirname, 'incontrol_token.json');

function saveToken(tokenData) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf8');
}

function loadToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

module.exports = { saveToken, loadToken };
