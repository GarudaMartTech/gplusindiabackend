const mongoose = require("mongoose")
const config = require("../config/index.js")

const connectDb = async () => {
    try {
        await mongoose.connect(`${config.MONGODB_URL}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });    
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};


module.exports = connectDb;