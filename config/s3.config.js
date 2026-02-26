const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
const config = require("./index");

const s3 = new S3Client({
  region: config.REGION,
  credentials: {
    accessKeyId: config.KEY_ID,
    secretAccessKey: config.SECRET_KEY,
  },
});

const uploadFile = async (file) => {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: `upload/${uuid()}`,
    Body: file,
    ContentType: file.mimetype || "image/webp",
  };

  const command = new PutObjectCommand(params);
  return await s3.send(command);
};

module.exports = uploadFile;
