const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");
const moment = require("moment");
const cors = require("cors");
const fs = require("fs");

const constants = require("./constants.json");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

app.use(cors());
const port = process.env.PORT || 3000;

const db = admin.firestore();

app.use(bodyParser.json());

const bot = new TelegramBot(constants.TELEGRAM_BOT_TOKEN);

app.post("/api/sendmessage", (req, res) => {
  const message = req.body.message;

  // Send the message to Telegram
  bot
    .sendMessage(constants.TELEGRAM_CHAT_ID, message)
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
    .sendMessage(constants.TELEGRAM_CHAT_ID, message)
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

// Endpoint to delete a Firestore document
app.delete("/delete-user/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const docRef = db.collection("users").doc(documentId);

    await docRef.delete();

    res.send("Document deleted successfully.");
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send("An error occurred while deleting the document.");
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
    res
      .status(500)
      .send("An error occurred while validating the document.");
  }
});

app.get("/auth-admin/:password", async (req, res) => {
  try {
    const { password } = req.params;
    const isAuthenticated = password === constants.ADMIN_PASSWORD;

    res.json({ isAuthenticated });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send("An error occurred while validating the document.");
  }
});

app.get("/auth-user/:password", async (req, res) => {
  try {
    const { password } = req.params;
    const isAuthenticated = password === constants.USER_PASSWORD;

    res.json({ isAuthenticated });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send("An error occurred while validating the document.");
  }
});

// Endpoint to update constants.json file
app.post("/update-constants", (req, res) => {
  try {
    const { constants: updatedConstants } = req.body;

    // Update the values of the specified constants
    for (const key in updatedConstants) {
      if (constants.hasOwnProperty(key)) {
        constants[key] = updatedConstants[key];
      }
    }

    // Write the updated constants.json file
    fs.writeFileSync(
      "./constants.json",
      JSON.stringify(constants, null, 2)
    );

    res.send(constants);
  } catch (error) {
    console.error("Error updating constants:", error);
    res
      .status(500)
      .send("An error occurred while updating the constants.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
