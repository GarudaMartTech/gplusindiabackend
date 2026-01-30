const axios = require("axios");
const config = require("../config/index");

const sendWhatsApp = async (phone, otp) => {
  try {
    if (!config.WHATSAPP_TOKEN || !config.WHATSAPP_PHONE_ID) {
      throw new Error("WhatsApp ENV missing");
    }

    // 🔥 phone normalize
    const cleanPhone = phone.replace(/\D/g, "");
    const to = cleanPhone.startsWith("91")
      ? cleanPhone
      : `91${cleanPhone}`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "otp", // EXACT Meta template name
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
          // ⚠️ ONLY if template has button
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    };

    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${config.WHATSAPP_PHONE_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp OTP sent", response.data);
    return true;
  } catch (error) {
    console.error(
      "WhatsApp send error:",
      error.response?.data || error.message
    );

    // 🔥 VERY IMPORTANT
    throw new Error(
      error.response?.data?.error?.message || "WhatsApp OTP failed"
    );
  }
};

module.exports = sendWhatsApp;
