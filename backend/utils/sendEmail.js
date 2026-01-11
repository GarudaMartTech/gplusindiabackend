const nodemailer = require("nodemailer");
const config = require("../config/index");
  

const sendEmail = async (options) => {
  // console.log(options)
  const transporter = nodemailer.createTransport({
    host: "mail.gplusindia.com",
    port : 465,
    secure: true,
    auth:{
      user: config.MAIL_USER,
      pass: config.MAIL_PASS
    },
  });

  const mailOptions = {
    from: `gplusindia.com ${config.MAIL_USER}`,
    to: options.email,  // user will enter email
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
