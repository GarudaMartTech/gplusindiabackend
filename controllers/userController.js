const { default: mongoose } = require("mongoose");
const User = require("../models/userModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const asyncHandler = require("../utils/asyncHandler.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const config = require("../config/index");
// const upload = multer({ storage: storage });
const AWS = require("aws-sdk");
// const { wishlist } = require("./productControllers.js");
const url = require("url");
const sendWhatsApp = require("../utils/sendWhatsApp");

const bucketName = config.BUCKET_NAME;
const bucketRegion = config.REGION;
const accessKey = config.KEY_ID;
const secretKey = config.SECRECT_KEY;

const client = new AWS.S3({
  accessKeyId: accessKey,
  secretAccessKey: secretKey,
  region: bucketRegion,
});

// registration router
exports.userRegister = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });

  if (existing) {
    return next(new ErrorHandler("User already exist.", 400));
  }

  const checkNumber = await User.findOne({ phone });

  if (checkNumber) {
    return next(new ErrorHandler("Number already exist.", 400));
  }

  if (
    req.file &&
    req.file.originalname &&
    req.file.originalname.trim() !== ""
  ) {
    const params = {
      Bucket: bucketName,
      Key: "profile-image/" + Date.now() + req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // let userAvatar 
    let data = await client.upload(params).promise();
    console.log("image uploaded successfull", data);

    const user = await User.create({
      name,
      email,
      phone,
      password,
      avatar: {
        public_id: data.ETag,
        url: data.Location,
      },
    });
    // console.log(user);
    sendToken(user, 200, res);
  } else {
    const user = await User.create({
      name,
      email,
      phone,
      password,
    });
    console.log("JWT_EXPIRE =>", config.JWT_EXPIRE);
    sendToken(user, 200, res);
  }
});

// login router
exports.userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // if (!email) {
  //   return next(new ErrorHandler("please enter email .",400));
  // }

  if (!email || !password) {
    return next(new ErrorHandler("please enter email and password ", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }
  console.log("JWT_EXPIRE =>", config.JWT_EXPIRE);
  sendToken(user, 200, res);

  // res.status(200).json(user)
});

// user loged out

exports.userLogout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOlny: true,
  });

  res.status(200).json({
    success: true,
    message: "Loged Out successfull",
  });
});

// SEND OTP
exports.sendWhatsappOtp = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new ErrorHandler("Phone number required", 400));
  }
  console.log("OTP request ", phone);
  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      name: "User",
      phone,
      email: `otp_${phone}@otp.com`,
      password: crypto.randomBytes(10).toString("hex"),
    });
    console.log("new user ", user.phone);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(" Generated OTP:", otp);
  user.otp = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  console.log(" OTP saved in DB, expiry:", new Date(user.otpExpire));
  await sendWhatsApp(phone, otp);
  console.log(" WhatsApp OTP sent");
  res.status(200).json({
    success: true,
    message: "OTP sent successfully on WhatsApp",
  });

  console.log("sendWhatsappOtp");
});

// VERIFY OTP
exports.verifyWhatsappOtp = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return next(new ErrorHandler("Phone & OTP required", 400));
  }
  console.log(" OTP request received ", phone);
  const user = await User.findOne({ phone });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.otp !== otp || user.otpExpire < Date.now()) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  //  SAME JWT LOGIN AS EMAIL
  sendToken(user, 200, res);
});

// forgot password

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  // console.log(user.name)

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  // reset password token
  const resetToken = user.getResetPassword();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.URL_LOCAL}/password/reset/${resetToken}`;

  const text = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <h1 style="font-size: 12px;">Dear ${user.name},</h1>
      <p style="font-size: 13px;">
        It seems you have forgotten your password. Please
        <a href=${resetUrl}>click</a> here to reset your password.
      </p>
  
      <p style="font-size: 12px;">
        Your password should have 8 or more characters with at least one uppercase
        letter, lowercase letter, number and special character. Please note that
        this link will expire in 24 hours.
      </p>
  
      <p style="font-size: 13px;">Do let us know if you face any problem in resetting your password.</p>
  
      <h1 style="font-size: 12px;">Best Regards</h1>
      <p style="font-size: 13px;">Team gplusindia.com</p>
      <p style="font-size: 13px;">info@gplusindia.com</p>
    </body>
  </html>
  `;

  // const text = `Your password reset url is \n\n ${resetUrl} \n\n`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Gshoppi.com - Reset Password`,
      html: text,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined);

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const Text = ` <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1 style="font-size: 12px;">Hi</h1>
    <p style="font-size: 12px;">
        As per your request, your password on gshoppi.com has been changed successfully for the username ${user.email}
    </p>

    <p style="font-size:13px;">
        In case of any queries, you can write to us at <a href="mailto:support@gshoppi.com">support@gshoppi.com</a>.
    </p>

    <h1 style="font-size: 12px;">Best Regards</h1>
    <p style="font-size: 12px;">Team gplusindia.com</p>
    <p style="font-size: 12px;">support@gplusindia.com</p>
  </body>
</html>
`;

  await sendEmail({
    email: user.email,
    subject: `gplusindia.com - Password Changed Successfully`,
    html: Text,
  });

  sendToken(user, 200, res);
});

// get single user details
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);


  sendToken(user, 200, res);
});

// get user by id  ---Admin
exports.getUserByid = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  res.status(200).json({
    success: true,
    user,
  });
});

// user update password

exports.userUpdatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Old password incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// user update profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // const id = req.id;

  // console.log("updateProfile",id)
  // console.log(req.user.avatar)

  // delete previous image
  let pathname = req.user.avatar.url;

  let urlObject = url.parse(pathname).pathname.slice(1);
  // console.log(urlObject)

  let deleteImage = {
    Bucket: bucketName,
    Key: urlObject,
  };
  await new Promise((resolve, reject) => {
    client.deleteObject(deleteImage, (err, data) => {
      if (err) {
        console.error("Error deleting object:", err);
        reject(err);
      } else {
        console.log("Object deleted successfully:", data);
        resolve();
      }
    });
  });

  // upload new image
  if (
    req.file &&
    req.file.originalname &&
    req.file.originalname.trim() !== ""
  ) {
    const params = {
      Bucket: bucketName,
      Key: "profile-image/" + Date.now() + req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    let data = await client.upload(params).promise();
    console.log("upadte image successfull", data);

    let userData = {
      name: req.body.name,
      email: req.body.email,
      avatar: {
        public_id: data.ETag,
        url: data.Location,
      },
    };

    const user = await User.findByIdAndUpdate(req.user.id, userData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  }

  res.status(200).json({
    success: true,
  });
});

// get user details --- Admin
exports.getAllUser = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// get single user profile --- Admin
exports.getSingleUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`user does not exit with id: ${req.params.id}`, 400)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//  update user role --- Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const newUserRole = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    phone: req.body.phone,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserRole, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(
      new ErrorHandler(`user does not exit with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

// delete user --- Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndRemove(req.params.id);

  const imgId = user.avatar.public_id;

  const params = {
    Bucket: bucketName,
    Key: "profile-image/" + user.avatar.url,
  };

  client.deleteObject(params, function (error, data) {
    if (error) {
      res.status({ error: "something went wrong" });
    }
    console.log("sucessfully deleted");
  });

  if (!user) {
    return next(
      new ErrorHandler(`user does not exit with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.getWishlist = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  if (_id === null) return;

  console.log();
  try {
    const finduser = await User.findById(_id).populate("wishlist");
    res.status(200).json({
      success: true,
      finduser,
    });
  } catch (error) {
    console.log(error);
  }
});

const sendStoreToken = (store, statusCode, res) => {
  const token = jwt.sign(
    { id: store._id, role: "STORE" },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      expires: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ),
    })
    .json({
      success: true,
      store: {
        id: store._id,
        storeName: store.storeName,
        role: "STORE",
      },
    });
};

