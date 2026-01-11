const app = require("./app")
const config = require("./config/index.js")
const http = require("http")
// const Razorpay = require("razorpay");



// uncaught error
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



// unhandled promise error
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`shutting down the server due to unhandled promise rejections`)

    server.close(()=>{
        process.exit(1)
    })
})