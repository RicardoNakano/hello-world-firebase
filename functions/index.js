const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  // Configurar cabeçalhos CORS
  response.set('Access-Control-Allow-Origin', '*'); // Permite todas as origens (ajuste pra maior segurança, ex.: 'https://hello-world-firebase-f1b5d.web.app')
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.set('Access-Control-Max-Age', '3600'); // Cache do preflight por 1 hora

  // Lidar com requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    response.status(204).send(''); // Responde com status 204 (No Content) pra preflight
    return;
  }

  // Verificar autenticação
  const authHeader = request.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).send('Unauthorized: Missing or invalid token');
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