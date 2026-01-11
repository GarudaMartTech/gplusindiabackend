// routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createBlog,
  getAllBlog,
  getBlogDetailsById,
  updateBlog,
  deleteBlog,
  uploadImage,
} = require("../controllers/blogController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// CREATE BLOG
router.post(
  "/admin/blog",
  isAuthenticatedUser,
  authorizeRoles("admin", "subadmin"),
  upload.array("images", 10),
  createBlog
);

// UPDATE BLOG
router.put(
  "/admin/blog/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "subadmin"),
  upload.array("images", 10),
  updateBlog
);

// DELETE BLOG
router.delete(
  "/admin/blog/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "subadmin"),
  deleteBlog
);

// USER ROUTES
router.get("/blogs", getAllBlog);
router.get("/blogs/:id", getBlogDetailsById);

// OPTIONAL IMAGE UPLOAD
router.post(
  "/subadmin/upload-image",
  upload.array("productImage", 10),
  isAuthenticatedUser,
  authorizeRoles("admin", "subadmin"),
  uploadImage
);

module.exports = router;
