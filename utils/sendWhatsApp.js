const axios = require("axios");
const config = require("../config/index");

const sendWhatsApp = async (phone, otp) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${config.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "template",
        template: {
          name: "otp",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: otp },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: otp, 
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp OTP sent");
  } catch (error) {
    console.error(
      "WhatsApp send error:",
      error.response?.data || error.message
    );
  }
};

module.exports = sendWhatsApp;
