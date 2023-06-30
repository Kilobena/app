import express from 'express';
import bodyParser from 'body-parser';
import axios  from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import {initializeApp}  from 'firebase/app';
import {getFirestore, getDoc, doc, updateDoc} from 'firebase/firestore';
import { config } from 'dotenv';

const app = express();
const port = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: 'AIzaSyAUDPSc0GjCkjCYZY3JzPLeHQv7x4JohBM',
  authDomain: 'alpha-beta-c59bf.firebaseapp.com',
  projectId: 'alpha-beta-c59bf',
  storageBucket: 'alpha-beta-c59bf.appspot.com',
  messagingSenderId: '391199010242',
  appId: '1:391199010242:web:bba372fccc230d6fb6ba5b'
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

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


app.post('/api/updatefirebase', (req, res) => {
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


// Endpoint to update a Firestore document
app.post('/update-user/:documentId', async (req, res) => {
  try {
    console.log("Request recieved", req.params);
    const { documentId } = req.params;
    const docRef = doc(db,"users", documentId)
    // const  docData = await getDoc(docRef);
  
    const data = req.body;

    await updateDoc(docRef, data);
    
    res.send('Document updated successfully.');
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).send('An error occurred while updating the document.');
  }
});

app.post('/create')

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
