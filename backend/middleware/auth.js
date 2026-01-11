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

  const decodedata = jwt.verify(token, config.JWT_SECRECT);

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
