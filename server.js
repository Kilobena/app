const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");
const moment = require("moment");
const cors = require("cors");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com",
});

const app = express();


app.use(cors());
const port = process.env.PORT || 3000;

const db = admin.firestore();

app.use(bodyParser.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

app.post("/api/sendmessage", (req, res) => {
  const message = req.body.message;

  // Send the message to Telegram
  bot
    .sendMessage(process.env.TELEGRAM_CHAT_ID, message)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error sending message to Telegram:", error);
      res.sendStatus(500);
    });
});

app.post("/api/updatefirebase", (req, res) => {
  const message = req.body.message;

  // Send the message to Telegram
  bot
    .sendMessage(process.env.TELEGRAM_CHAT_ID, message)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error sending message to Telegram:", error);
      res.sendStatus(500);
    });
});

// Endpoint to update a Firestore document
app.post("/update-user/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const docRef = db.collection("users").doc(documentId);

      const data = req.body;

      await docRef.update(data);

      res.send("Document updated successfully.");
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).send("An error occurred while updating the document.");
    }
});

app.get("/validate-document/:id", async (req, res) => {
    try {
      const now = moment();
      const { id } = req.params;

      const docRef = db.collection("users").doc(id);
      const docSnapshot = await docRef.get();

      let documentId;

      if (docSnapshot.exists) {
        // Document exists, return the same ID
        documentId = id;
      } else {
        const newDocRef = await db.collection("users").add({
          createdAt: now.format("YYYY-MM-DD,hh:mm:ss"),
          base64Img: "",
        });

        documentId = newDocRef.id;
      }

      res.json({ documentId }); // Sending the document ID in the response
    } catch (error) {
      console.error("Error validating document:", error);
      res.status(500).send("An error occurred while validating the document.");
    }
});

app.get("/auth-admin/:password", async (req, res) => {

    try {
      const { password } = req.params;
      const isAuthenticated = password === process.env.ADMIN_PASSWORD;

      res.json({ isAuthenticated });
    } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while validating the document.");
    }
  
});


// API endpoint to get real-time user data
app.get('/users-live-data', (req, res) => {
  const usersRef = db.collection('users');

  // Subscribe to real-time updates
  const unsubscribe = usersRef.onSnapshot(snapshot => {
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Send the updated data to the client
    res.json(users);
  });

  // Clean up the listener when the client disconnects
  res.on('close', () => {
    unsubscribe();
  });
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
