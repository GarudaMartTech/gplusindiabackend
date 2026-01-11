
// import jwt from "jsonwebtoken";
// import Admin from "../models/Admin.js";

// export const protect = async (req, res, next) => {
//   try {
//     const header = req.headers.authorization;
//     if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Not authorized" });
//     const token = header.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.admin = await Admin.findById(decoded.id).select("-password");
//     if (!req.admin) return res.status(401).json({ message: "Admin not found" });
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Token invalid" });
//   }
// };                      

const ErrorHandler = require("../utils/ErrorHandler");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/index");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
// console.log("token", token)
// console.log("function called")
  if (!token) {
    return next(new ErrorHandler("please login to access this resource", 401));
  }

  const decodedata = jwt.verify(token, config.JWT_SECRET);

  req.user = await User.findById(decodedata.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
  
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

