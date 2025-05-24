const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

admin.initializeApp();

// Configurar cliente do Twitter com as credenciais do .env
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Função helloWorld (já existente)
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.set('Access-Control-Max-Age', '3600');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

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

// Novo webhook para postar tweet
exports.postTweet = functions.https.onRequest(async (request, response) => {
  // Configurar cabeçalhos CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Max-Age', '3600');

  // Lidar com requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  // Verificar se é uma requisição POST
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed: Use POST');
    return;
  }

  // Obter o texto do tweet do corpo da requisição
  const tweetText = request.body.text;
  if (!tweetText || typeof tweetText !== 'string') {
    response.status(400).send('Bad Request: Missing or invalid "text" in body');
    return;
  }

  try {
    // Postar o tweet usando o cliente do Twitter
    const tweet = await twitterClient.v2.tweet(tweetText);
    response.status(200).send({
      success: true,
      message: 'Tweet posted successfully',
      tweetId: tweet.data.id
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    response.status(500).send({
      success: false,
      message: 'Error posting tweet: ' + error.message
    });
  }
});