const aws = require("@aws-sdk/client-s3")
const fs = require("fs")
const config = require("./index")
const uuid = require("uuid").v4


const s3 = new aws.S3({
    accessKeyId:config.KEY_ID,
    secretAccessKeyId:config.SECRECT_KEY,
    region:config.REGION
})




const uploadFile = async (file) =>{
    const param = {
        Bucket: config.BUCKET_NAME,
        key: `upload/${uuid()}`,
        Body: file
    }

    return await s3.uploadPart(param).promise()
}

module.exports = uploadFile