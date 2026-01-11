const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String,
      required: [true, "please enter your email"],
      maxLength: [30, "name can not exceed 30 char"],
      minLength: [3, "name should have more than 3 character"],
      trim: true 
    },  
    email: {
      type: String,
      required: [true, "please enter your email"], 
      unique: true,
      trim: true,
      validate: [validator.isEmail, "please enter a valid email"],
    },
    phone:{
      type: Number,
      // required: [true,"please enter the number"],
      maxLength: [10,"number should be 10 character"],
      unique: true
    }, 
    
    password: { 
      type: String,
      required: [true, "please enter your password"],
      minLength: [8, "password should be greater than 8 character"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["customer", "store_manager","user", "admin"],
      default: "user",
    },
    // address: {
    //   type: mongoose.Schema.Types.Mixed,
    // },
    wishlist:[{type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,


    // WHATSAPP OTP LOGIN 
    otp: String,
    otpExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredpassword) {
  return bcrypt.compare(enteredpassword, this.password);
};

// generate forgot password
userSchema.methods.getResetPassword = function () {
  const forgotToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
