const mongoose = require("mongoose");
const slugify = require("slugify");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    // IMPORTANT: slug field (unique)
    slug: {
      type: String,
      unique: true,
      index: true,
    },

    images: [
      {
        imageId: String,
        url: String,
      },
    ],

    category: {
      type: String,
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
    },
  },
  { timestamps: true }
);

// AUTO-GENERATE SLUG BEFORE SAVE
BlogSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug =
      slugify(this.title, {
        lower: true,
        strict: true,
      }) +
      "-" +
      Date.now();
  }
  next();
});

module.exports = mongoose.model("Blog", BlogSchema);
