const { refreshBearerToken } = require('./services/incontrol2');
const fs = require('fs');
const path = require('path');

// Chemin du fichier token
const tokenPath = path.join(__dirname, 'services/incontrol_token.json');

async function main() {
  let tokenData;
  try {
    tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  } catch {
    console.error('Token file not found or invalid.');
    return;
  }
  const refreshToken = tokenData.refresh_token;
  if (!refreshToken) {
    console.error('No refresh_token found in token file.');
    return;
  }
  try {
    const newToken = await refreshBearerToken(refreshToken);
    console.log('New token:', newToken);
    // Sauvegarde le nouveau token
    fs.writeFileSync(tokenPath, JSON.stringify(newToken, null, 2), 'utf-8');
    console.log('Token updated in incontrol_token.json');
  } catch (err) {
    console.error('Error refreshing token:', err.message);
  }
}

main();
