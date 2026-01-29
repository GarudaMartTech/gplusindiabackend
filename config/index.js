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

  // MAIL_USER: process.env.MAIL_USER,
  // MAIL_PASS: process.env.MAIL_PASS,
  // MAIL_SERVICE: process.env.MAIL_SERVICE,
  // MAIL_HOST:process.env.MAIL_HOST,
  // MAIL_PORT:process.env.MAIL_PORT,
  URL_LOCAL: process.env.URL_LOCAL,
  // RAZORPAY_KEY: process.env.RAZORPAY_KEY,
  // RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,
  KEY_ID: process.env.KEY_ID,
  SECRECT_KEY: process.env.SECRECT_KEY,
  REGION: process.env.REGION,
  BUCKET_NAME: process.env.BUCKET_NAME,
  // PUBLISHABLE_KEY:process.env.PUBLISHABLE_KEY,
  // STRIPE_SECRECT_KEY:process.env.STRIPE_SECRECT_KEY,
  // STRIPE_ENDPOINT_SECRECT:process.env.STRIPE_ENDPOINT_SECRECT
};

module.exports = config;
