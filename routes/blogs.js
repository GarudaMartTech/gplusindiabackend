import express from "express";
import slugify from "slugify";
import Blog from "../models/Blog.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();



// Get all published blogs (for website listing)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
});

// Get single blog by slug (SEO-friendly)
router.get("/slug/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
});

//  Get single blog by ID (for admin panel preview or direct access)
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
});



//  Get all blogs (including drafts)
router.get("/admin/all", protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin blogs", error });
  }
});

// Create a new blog
router.post("/", protect, async (req, res) => {
  try {
    const { title, excerpt, content, tags = [], imageUrl, published = true } = req.body;

    let slug = slugify(title, { lower: true, strict: true });

    // Ensure slug uniqueness
    let uniqueSlug = slug;
    let i = 1;
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${i++}`;
    }

    const blog = await Blog.create({
      title,
      slug: uniqueSlug,
      excerpt,
      content,
      tags,
      imageUrl,
      published,
      author: req.admin?._id || null,
    });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update blog
router.put("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    Object.assign(blog, req.body);
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error });
  }
});

// Delete blog
router.delete("/:id", protect, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
});

export default router;
