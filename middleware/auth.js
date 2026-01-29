const ErrorHandler = require("../utils/ErrorHandler");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const User = require("../models/userModel");
const Store = require("../models/Store");

/* ===============================
   USER / ADMIN AUTH
================================ */
exports.isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  //  user route 
  if (decoded.role === "STORE") {
    return next(new ErrorHandler("Not authorized as user", 403));
  }

  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return next(new ErrorHandler("User not found", 401));
  }

  next();
});

/* ROLE BASED AUTH (ADMIN, USER) */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed`,
          403
        )
      );
    }
    next();
  };
};

/* ===============================
   STORE AUTH
================================ */
exports.isAuthenticatedStore = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login as store", 401));
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  //  FIXED HERE
  if (decoded.role !== "STORE") {
    return next(new ErrorHandler("Not authorized as store", 403));
  }

  req.store = await Store.findById(decoded.id);

  if (!req.store) {
    return next(new ErrorHandler("Store not found", 404));
  }

  next();
});

/* OPTIONAL EXTRA PROTECTION */
exports.authorizeStore = (req, res, next) => {
  if (!req.store) {
    return next(new ErrorHandler("Store access only", 403));
  }
  next();
};

/* ======================================================
   USER OR STORE OR ADMIN ACCESS
====================================================== */
exports.isAuthenticatedUserOrStore = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  //  STORE LOGIN
   if (decoded.role !== "STORE") {
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ErrorHandler("User not found", 401));
    }
    return next();
  }

  //  STORE
  req.store = await Store.findById(decoded.id);
  if (!req.store) {
    return next(new ErrorHandler("Store not found", 404));
  }

  next();
});
