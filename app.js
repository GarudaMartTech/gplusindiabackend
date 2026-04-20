const express = require("express");
const connectDb = require("./database/db.js");
const errorMiddleware = require("./middleware/error.js");

const userRouter = require("./routes/userRoute.js");
const blogRouter = require("./routes/blogRoute.js");
const complaintRouter = require("./routes/complaintRoute.js");

/*  NEW STORE ROUTES */
const storeRouter = require("./routes/storeRoute.js");

const config = require("./config/index.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");

const app = express();
connectDb();

/* =========================
   CORS CONFIG
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.0.100:3000",
      "https://gplusindia.com",
      "https://www.gplusindia.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   BODY & COOKIE
========================= */
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "200mb" }));

/* =========================
   ROUTES
========================= */
app.use("/api/v1", userRouter);
app.use("/api/v1", blogRouter);
app.use("/api/v1/complaints", complaintRouter);

/* STORE ROUTES */
app.use("/api/v1/store", storeRouter);

/*
   WHATSAPP WEBHOOK
========================= */

app.get("/api/v1/webhook", (req, res) => {
  const VERIFY_TOKEN = "garudamartToken123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook Verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

//  HANDLE INCOMING MESSAGES
const axios = require("axios");

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; 
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID; 

// Auto Reply Function
const sendReply = async (to, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Reply Error:", error.response?.data || error.message);
  }
};


app.post("/api/v1/webhook", async (req, res) => {
  try {
    console.log("📩 Webhook Event Received");

    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      //  Incoming Message
      if (value?.messages) {
        const message = value.messages[0];

        const from = message.from; // user number
        const msgType = message.type;

        let userMessage = "";

        if (msgType === "text") {
          userMessage = message.text.body;
        }

        console.log("👤 User:", from);
        console.log("💬 Message:", userMessage);

        //  AUTO REPLY
        await sendReply(from, "Hello  Thanks for contacting GPlus! Our team will reply soon.");
      }

      //  Delivery / Status Tracking
      if (value?.statuses) {
        const status = value.statuses[0];
        console.log("📦 Message Status:", status.status);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.sendStatus(500);
  }
});

/* =========================
   ERROR HANDLER
========================= */
app.use(errorMiddleware);

module.exports = app;
