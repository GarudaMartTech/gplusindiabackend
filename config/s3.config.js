const aws = require("@aws-sdk/client-s3")
const fs = require("fs")
const config = require("./index")
const uuid = require("uuid").v4


const s3 = new S3Client({
  region: config.REGION,
  credentials: {
    accessKeyId: config.KEY_ID,
    secretAccessKey: config.SECRECT_KEY,
  },
});




const uploadFile = async (file) =>{
    const param = {
        Bucket: config.BUCKET_NAME,
        key: `upload/${uuid()}`,
        Body: file
    }

      const command = new PutObjectCommand(params);
  return await s3.send(command);
}

module.exports = uploadFile