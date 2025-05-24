const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const authHeader = request.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).send('Unauthorized');
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      response.send(`Hello World! Bem-vindo, ${decodedToken.name || 'usuário'}!`);
    })
    .catch((error) => {
      response.status(401).send('Unauthorized: ' + error.message);
    });
});