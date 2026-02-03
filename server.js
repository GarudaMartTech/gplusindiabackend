// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import connectDB from "./database/db.js";
// import adminAuthRoutes from "./routes/adminAuth.js";
// import blogRoutes from "./routes/blogs.js";
// import uploadRoutes from "./routes/upload.js";

// dotenv.config(); // Load .env variables

// const app = express();

// // Security Middlewares
// app.use(helmet());
// app.use(express.json({ limit: "10mb" })); // handle JSON payloads safely

// // CORS setup — allow only trusted origins
// app.use(
//   cors({
//     origin: [
//       "https://gplusindia.com",
//       "https://www.gplusindia.com",
//       "http://localhost:3000"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );


// // Connect MongoDB and start the server
// const startServer = async () => {
//   try {
//     await connectDB();
//     // console.log(" MongoDB Connected Successfully");

//     // Routes
//     app.use("/api/admin", adminAuthRoutes);
//     app.use("/api/blogs", blogRoutes);
//     app.use("/api/upload", uploadRoutes);

//     // Test route
//     app.get("/api/test", (req, res) => {
//       res.json({ message: "API is working fine" });
//     });

//     // Default root route
//     app.get("/", (req, res) => res.send("API OK"));

//     // Start Server
//     const PORT = process.env.PORT || 5000;
//     const HOST = "0.0.0.0"; //  Allow connections from anywhere (important for EC2)
//     app.listen(PORT, HOST, () => {
//       // console.log(` Server running on http://${HOST}:${PORT}`);
//     }); 
//   } catch (err) {
//     console.error(" Error starting server:", err.message);
//     process.exit(1);
//   }
// };

// startServer();




const app = require("./app")
const config = require("./config/index.js")
const http = require("http")

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to uncaught error`)

    process.exit(1);
})

const PORT = config.PORT 


const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});




process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`shutting down the server due to unhandled promise rejections`)

    server.close(()=>{
        process.exit(1)
    })
})
