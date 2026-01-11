const axios = require("axios");
const config = require("../config/index");

const sendWhatsAppTemplate = async (
  to,
  templateName,
  complaintId,
  complaintName
) => {
  try {
    console.log("📤 WhatsApp TEMPLATE SEND START");
    console.log("➡️ To:", to);
    console.log("📄 Template:", templateName);

    if (!to || !templateName) return;

    let parameters = [];

    // complaint_received → {{1}} = complaintId
    if (templateName === "complaint_received") {
      parameters = [
        { type: "text", text: String(complaintId) },
      ];
    }

    // service_progress & services_resolved
    // {{1}} = customer name
    // {{2}} = complaint id
    if (
      templateName === "service_progress" ||
      templateName === "services_resolved"
    ) {
      parameters = [
        { type: "text", text: String(complaintName) },
        { type: "text", text: String(complaintId) },
      ];
    }

    const payload = {
      messaging_product: "whatsapp",
      to: String(to),
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters,
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

    console.log("✅ WhatsApp SENT SUCCESS");
    return response.data;
  } catch (error) {
    console.error("❌ WhatsApp ERROR:", error?.response?.data || error.message);
  }
};

module.exports = sendWhatsAppTemplate;
