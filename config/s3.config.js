const AWS = require("aws-sdk");
const config = require("./index");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  accessKeyId: config.KEY_ID,
  secretAccessKey: config.SECRECT_KEY,
  region: config.REGION,
});

const s3 = new AWS.S3();

const uploadFile = async (file) => {
  const fileKey = `blog/${uuidv4()}.jpg`;

  const params = {
    Bucket: config.BUCKET_NAME,  // 🔥 yahi important hai
    Key: fileKey,
    Body: file.buffer,           // 🔥 multer buffer
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();

  return data.Location;
};

module.exports = uploadFile;
