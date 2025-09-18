// backend/services/incontrol2.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const INCONTROL_BASE_URL = 'https://incontrol.venn.be';
const CLIENT_ID = process.env.INCONTROL_CLIENT_ID;
const CLIENT_SECRET = process.env.INCONTROL_CLIENT_SECRET;
const REDIRECT_URI = process.env.INCONTROL_REDIRECT_URI;

// Step 1: User must visit this URL to authorize and get code
function getAuthorizationUrl() {
  return `${INCONTROL_BASE_URL}/api/oauth2/auth?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

// Step 2: Exchange code for access token
async function getBearerToken(code) {
  try {
    const tokenUrl = `${INCONTROL_BASE_URL}/api/oauth2/token`;
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code', code);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting bearer token:', error.response?.data || error.message);
    throw error;
  }
}

// Step 3: Refresh token when expired
async function refreshBearerToken(refreshToken) {
  try {
    const tokenUrl = `${INCONTROL_BASE_URL}/api/oauth2/token`;
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error refreshing bearer token:', error.response?.data || error.message);
    throw error;
  }
}

// API call example: get device by serial
async function getDeviceBySerial(orgId, serial, accessToken) {
  try {
    const url = `${INCONTROL_BASE_URL}/rest/o/${orgId}/sn/${serial}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting device by serial:', error.response?.data || error.message);
    throw error;
  }
}


module.exports = {
  getAuthorizationUrl,
  getBearerToken,
  refreshBearerToken,
  getDeviceBySerial,
};


