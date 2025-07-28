const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

// Initialize firebase admin with your service account
const serviceAccount = require("../firebase-service-account.json");
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin, firebaseApp };
