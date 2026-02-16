const dotenv = require("dotenv");
dotenv.config();

const config = {
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  COOKIE_EXPIRE: Number(process.env.COOKIE_EXPIRE || 5),

  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID,

  KEY_ID: process.env.KEY_ID,
  SECRECT_KEY: process.env.SECRECT_KEY,
  REGION: process.env.REGION,
  BUCKET_NAME: process.env.AWS_BUCKET_NAME,
};

module.exports = config;
