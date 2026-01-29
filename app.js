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
      "http://192.168.0.107:3000",
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

/* =========================
   ERROR HANDLER
========================= */
app.use(errorMiddleware);

module.exports = app;
