const ErrorHandler = require("../utils/ErrorHandler");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const User = require("../models/userModel");
const Store = require("../models/Store");

/* ================= USER / ADMIN ================= */
exports.isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  if (decoded.role === "STORE") {
    return next(new ErrorHandler("User access only", 403));
  }

  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return next(new ErrorHandler("User not found", 401));
  }

  next();
});

/* ================= ROLE AUTH ================= */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role ${req.user?.role} not allowed`, 403)
      );
    }
    next();
  };
};

/* ================= STORE ================= */
exports.isAuthenticatedStore = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Store login required", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  if (decoded.role !== "STORE") {
    return next(new ErrorHandler("Store access only", 403));
  }

  req.store = await Store.findById(decoded.id);

  if (!req.store) {
    return next(new ErrorHandler("Store not found", 404));
  }

  next();
});

/* ================= USER OR STORE ================= */
exports.isAuthenticatedUserOrStore = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Login required", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  if (decoded.role === "STORE") {
    req.store = await Store.findById(decoded.id);
    if (!req.store) {
      return next(new ErrorHandler("Store not found", 404));
    }
    return next();
  }

  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found", 401));
  }

  next();
});
