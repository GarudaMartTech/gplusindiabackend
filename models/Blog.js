
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: { type: String, required: true },
  imageUrl: String,
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Blog", BlogSchema);
