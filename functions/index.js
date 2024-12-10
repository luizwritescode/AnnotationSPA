/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

require("dotenv").config();

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const express = require('express');
const basicAuth = require('express-basic-auth');

const app = express();

const myAuthorizer = (username, password) => {
  const userMatches = basicAuth.safeCompare(username, process.env.CANDIDATE_USERNAME);
  const passwordMatches = basicAuth.safeCompare(password, process.env.CANDIDATE_PASSWORD);

  return userMatches & passwordMatches;
}

app.use(basicAuth({
	authorizer: myAuthorizer,
 	challenge: true,
}));

app.get('*', (req, res) => {
	// redirect to hosting index
	console.log('redirecting to app.html');
	res.redirect('/app.html');
});

exports.app = onRequest(app);