const app = require("./app");
const config = require("./config/index.js");
const http = require("http");

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥");
  console.error(err.name, err.message);
  console.error("Shutting down the server due to uncaught exception...");
  process.exit(1);
});

const PORT = config.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("======================================");
  console.log(`🚀 Server running successfully`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log("======================================");
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥");
  console.error(err.name, err.message);
  console.error("Shutting down the server due to unhandled promise rejection...");

  server.close(() => {
    process.exit(1);
  });
});
