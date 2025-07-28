const axios = require('axios');

// Zoom API Configuration
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_BASE_URL = 'https://api.zoom.us/v2';

// Token cache
let accessToken = null;
let accessTokenExpiry = null;

// Fetch OAuth access token
const fetchAccessToken = async () => {
  // If token is valid, return it
  if (accessToken && accessTokenExpiry && Date.now() < accessTokenExpiry) {
    return accessToken;
  }
  const tokenUrl = 'https://zoom.us/oauth/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'account_credentials');
  params.append('account_id', ZOOM_ACCOUNT_ID);

  const auth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    accessToken = response.data.access_token;
    // Set expiry 1 minute before actual expiry for safety
    accessTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error fetching Zoom OAuth access token:', error.response?.data || error.message);
    throw error;
  }
};

// Zoom API helper functions
const zoomAPI = {
  // Create a new meeting
  createMeeting: async (meetingData) => {
    try {
      const token = await fetchAccessToken();
      const response = await axios.post(`${ZOOM_BASE_URL}/users/me/meetings`, meetingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get meeting details
  getMeeting: async (meetingId) => {
    try {
      const token = await fetchAccessToken();
      const response = await axios.get(`${ZOOM_BASE_URL}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Zoom meeting:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get recording files
  getRecordings: async (meetingId) => {
    try {
      const token = await fetchAccessToken();
      const response = await axios.get(`${ZOOM_BASE_URL}/meetings/${meetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Zoom recordings:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete meeting
  deleteMeeting: async (meetingId) => {
    try {
      const token = await fetchAccessToken();
      await axios.delete(`${ZOOM_BASE_URL}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting Zoom meeting:', error.response?.data || error.message);
      throw error;
    }
  }
};

module.exports = { zoomAPI }; 