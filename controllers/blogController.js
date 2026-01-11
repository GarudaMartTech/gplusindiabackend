const AWS = require("aws-sdk");
const sharp = require("sharp");
const BlogModel = require("../models/BlogModel");
const UploadImage = require("../models/upload");
const userModel = require("../models/userModel");
const config = require("../config/index");

// AWS S3 CONFIG
const s3 = new AWS.S3({
  accessKeyId: config.KEY_ID,
  secretAccessKey: config.SECRECT_KEY,
  region: config.REGION,
});

// S3 UPLOAD HELPER
async function uploadBufferToS3(buffer, bucketPath, mimetype) {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: bucketPath,
    Body: buffer,
    ContentType: mimetype,
  };
  return await s3.upload(params).promise();
}

// =======================
// CREATE BLOG
// =======================
exports.createBlog = async (req, res) => {
  try {
    console.log("USER 👉", req.user);
    console.log("BODY 👉", req.body);
    console.log("FILES 👉", req.files);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { title, category, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const user = await userModel
      .findById(req.user._id)
      .select("name")
      .lean();

    const images = [];

    // 🔥 ONLY COMPRESSION UPDATED (Blog ~50KB)
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (let file of req.files) {
        if (!file.buffer) continue;

        const resized = await sharp(file.buffer)
          .resize(900, 600, { fit: "inside" })
          .jpeg({ quality: 60 })   // 🔥 compression
          .toBuffer();

        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "_");
        const key = `blogs-image/${timestamp}_${safeName}`;

        const data = await uploadBufferToS3(
          resized,
          key,
          "image/jpeg"
        );

        images.push({
          imageId: data.ETag,
          url: data.Location,
        });
      }
    }

    const blog = await BlogModel.create({
      title,
      category,
      content,
      images,
      user: req.user._id,
      userName: user?.name || "Unknown",
    });

    res.status(201).json({
      success: true,
      blog,
    });
  } catch (err) {
    console.error("CREATE BLOG ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// GET ALL BLOGS
// =======================
exports.getAllBlog = async (req, res) => {
  try {
    const allBlogs = await BlogModel.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      allBlogs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// GET BLOG BY ID
// =======================
exports.getBlogDetailsById = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// UPDATE BLOG
// =======================
exports.updateBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const { title, category, content } = req.body;

    if (title) blog.title = title;
    if (category) blog.category = category;
    if (content) blog.content = content;

    // 🔥 ONLY COMPRESSION UPDATED (Blog ~50KB)
    if (Array.isArray(req.files) && req.files.length > 0) {
      const images = [];

      for (let file of req.files) {
        const resized = await sharp(file.buffer)
          .resize(900, 600, { fit: "inside" })
          .jpeg({ quality: 60 })
          .toBuffer();

        const key = `blogs-image/${Date.now()}_${file.originalname}`;
        const data = await uploadBufferToS3(resized, key, "image/jpeg");

        images.push({ imageId: data.ETag, url: data.Location });
      }

      blog.images = images;
    }

    await blog.save();

    res.status(200).json({
      success: true,
      updatedBlog: blog,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =======================
// DELETE BLOG
// =======================
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =======================
// IMAGE UPLOAD (Product / Mapping ~80KB)
// =======================
exports.uploadImage = async (req, res) => {
  try {
    const imageUrl = [];

    if (Array.isArray(req.files) && req.files.length > 0) {
      for (let file of req.files) {
        if (!file.buffer) continue;

        const resized = await sharp(file.buffer)
          .resize(1200, 1200, { fit: "inside" })
          .jpeg({ quality: 70 })   // 🔥 compression
          .toBuffer();

        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "_");
        const key = `mapping-image/${timestamp}_${safeName}`;

        const data = await uploadBufferToS3(
          resized,
          key,
          "image/jpeg"
        );

        imageUrl.push({
          imageId: data.ETag,
          url: data.Location,
        });
      }
    }

    const record = await UploadImage.create({
      productImage: imageUrl,
    });

    res.status(200).json({
      success: true,
      imageRecord: record,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
