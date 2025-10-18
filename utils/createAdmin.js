import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();
await connectDB();

const hashed = await bcrypt.hash("admin1234", 10);

await Admin.deleteMany(); // clear old admin

await Admin.create({
  name: "Admin",
  email: "admin@gplusindia.com",
  password: hashed,
  role: "admin",
});

console.log("Admin created successfully with email admin@gplusindia.com and password admin1234");
process.exit();
