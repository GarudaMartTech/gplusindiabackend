// utils/seedAdmin.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js"; // agar path alag ho to adjust karo

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "your_mongo_uri_here";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo connected");

    const email = "admin@gplusindia.com";
    const name = "Super Admin";
    const plain = "admin123";

    let admin = await Admin.findOne({ email });
    if (admin) {
      console.log("Admin already exists. Updating password (hash)...");
      const hashed = await bcrypt.hash(plain, 10);
      admin.password = hashed;
      await admin.save();
      console.log("Password updated for", email);
    } else {
      const hashed = await bcrypt.hash(plain, 10);
      admin = new Admin({ name, email, password: hashed });
      await admin.save();
      console.log("Admin created:", email);
    }
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

run();
