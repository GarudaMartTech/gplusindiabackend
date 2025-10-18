import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js"; // path sahi rakhna

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected");

    const hashedPassword = await bcrypt.hash("admin1234", 10);

    const existing = await Admin.findOne({ email: "admin@gplusindia.com" });
    if (existing) {
      console.log("⚠️ Admin already exists");
      return;
    }

    await Admin.create({
      name: "Super Admin",
      email: "admin@gplusindia.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
