const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Store = require("../models/Store");
const jwt = require("jsonwebtoken");
const config = require("../config/index");

/* ===============================
   STORE LOGIN
================================ */
exports.storeLogin = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ErrorHandler("Username & password required", 400));
  }

  const store = await Store.findOne({ username }).select("+password");

  if (!store) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const isMatch = await store.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  /* 🔑 JWT TOKEN */
  const token = jwt.sign(
    {
      id: store._id,
      role: "STORE",
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRE,
    }
  );

  /* 🍪 COOKIE */
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + config.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  });

  res.status(200).json({
    success: true,
    message: "Store login successful",
    store: {
      id: store._id,
      storeName: store.storeName,
      username: store.username,
      role: store.role,
    },
  });
});
