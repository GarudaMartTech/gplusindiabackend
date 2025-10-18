// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import blogRoutes from "./routes/blogs.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config(); //  Load .env variables

const app = express();

//  Security Middlewares
app.use(helmet());
app.use(express.json({ limit: "10mb" })); // handle JSON payloads safely

//  CORS setup — restrict only to frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

//  Connect MongoDB (async safe)
const startServer = async () => {
  try {
    await connectDB();
    console.log(" MongoDB Connected Successfully");

    //  Routes
    app.use("/api/admin", adminAuthRoutes);
    app.use("/api/blogs", blogRoutes);
    app.use("/api/upload", uploadRoutes);

    //  Simple test route
    app.get("/api/test", (req, res) => {
      res.json({ message: "API is working fine " });
    });

    //  Default root route
    app.get("/", (req, res) => res.send("API OK"));

    //  Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(` Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error(" Error starting server:", err.message);
    process.exit(1);
  }
};

startServer();
