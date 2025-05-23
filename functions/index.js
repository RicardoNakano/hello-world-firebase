const functions = require('firebase-functions');

exports.helloWorld = functions.https.onRequest((request, response) => {
  // Adiciona cabeçalhos CORS
  response.set('Access-Control-Allow-Origin', '*'); // Permite todos os domínios (ou use 'https://hello-world-firebase-f1b5d.web.app' pra ser específico)
  response.set('Access-Control-Allow-Methods', 'GET, POST'); // Métodos permitidos
  response.set('Access-Control-Allow-Headers', 'Content-Type'); // Cabeçalhos permitidos

  // Responde com "Hello World!"
  response.send('Hello World!');
});