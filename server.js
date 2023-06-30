import express from 'express';
import bodyParser from 'body-parser';
import axios  from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import {initializeApp}  from 'firebase/app';
import {getFirestore, getDoc, doc, updateDoc, addDoc, collection} from 'firebase/firestore';
import { config } from 'dotenv';
import * as moment from "moment";

const app = express();
const port = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
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

app.post('/validate-document/:id', async (req, res) => {
  try {
    const now = moment();
    const { id } = req.params;
    
    const docRef = doc(db, 'users', id);
    const docSnapshot = await getDoc(docRef);
    
    let documentId;

    if (docSnapshot.exists()) {
      // Document exists, return the same ID
      documentId = id;
    } else {
      const newDocRef = await addDoc(collection(db, 'users'), {
        createdAt: now.format('YYYY-MM-DD,hh:mm:ss'),
        base64Img: '',
      });

      documentId = newDocRef.id;
    }
    
    res.json({ documentId }); // Sending the document ID in the response
  } catch (error) {
    console.error('Error validating document:', error);
    res.status(500).send('An error occurred while validating the document.'); 
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
