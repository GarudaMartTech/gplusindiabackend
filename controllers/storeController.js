const Store = require("../models/Store");
const Complaint = require("../models/Complaint");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const ErrorHandler = require("../utils/ErrorHandler");
const asyncHandler = require("../utils/asyncHandler");

/* =========================
   STORE LOGIN
========================= */
exports.storeLogin = asyncHandler(async (req, res, next) => {
  let { username, password } = req.body;

  console.log(" STORE LOGIN HIT");
  console.log(" RAW BODY:", req.body);

  if (!username || !password) {
    console.log(" Username or Password missing");
    return next(new ErrorHandler("Username & Password required", 400));
  }

  // normalize username
  username = username.toLowerCase();
  console.log(" NORMALIZED USERNAME:", username);

  // find store
  const store = await Store.findOne({ username }).select("+password");

  console.log(" STORE FOUND:", store ? "YES" : "NO");

  if (!store) {
    console.log(" Store not found in DB");
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  console.log(" STORE USERNAME IN DB:", store.username);
  console.log(" STORE ACTIVE:", store.active);

  const isMatch = await store.comparePassword(password);
  console.log(" PASSWORD MATCH:", isMatch);

  if (!isMatch) {
    console.log(" Password mismatch");
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  if (!store.active) {
    console.log(" Store inactive");
    return next(new ErrorHandler("Store account is inactive", 403));
  }

  const token = jwt.sign(
    { id: store._id, role: "STORE" },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );

  console.log(" STORE LOGIN SUCCESS");

  store.password = undefined;

  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        username: store.username,
        role: "STORE",
      },
    });
});

/* =========================
   STORE ASSIGNED COMPLAINTS
========================= */
exports.getAssignedComplaints = asyncHandler(async (req, res) => {
  console.log("GET ASSIGNED COMPLAINTS, STORE:", req.store?._id);

  const complaints = await Complaint.find({
    assignedStore: req.store._id,
  });

  res.status(200).json({
    success: true,
    count: complaints.length,
    complaints,
  });
});

/* =========================
   STORE DASHBOARD
========================= */
exports.storeDashboard = asyncHandler(async (req, res) => {
  console.log(" STORE DASHBOARD ACCESS:", req.store?._id);

  const complaints = await Complaint.find({
    assignedStore: req.store._id,
  });

  res.status(200).json({
    success: true,
    totalComplaints: complaints.length,
    complaints,
  });
});

/* =========================
   CREATE STORE 
========================= */
exports.createStore = asyncHandler(async (req, res) => {
  console.log(" CREATE STORE BODY:", req.body);

  const store = await Store.create({
    ...req.body,
    username: req.body.username.toLowerCase(),
    role: "STORE",
  });

  res.status(201).json({
    success: true,
    store,
  });
});

/* =========================
   GET ALL STORES (ADMIN)
========================= */
exports.getAllStores = asyncHandler(async (req, res) => {
  console.log(" GET ALL STORES WITH COMPLAINT COUNT");

  const stores = await Store.aggregate([
    // {
    //   $lookup: {
    //     from: "complaints",            // Complaint collection
    //     localField: "_id",             // Store _id
    //     foreignField: "assignedStore", // Complaint field
    //     as: "complaints"
    //   }
    // },
    {
      $addFields: {
        complaintsCount: { $size: { $ifNull: ["$assignedComplaints", []] } }
      }
    },
    {
      $project: {
        complaints: 0,   
        password: 0
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    count: stores.length,
    stores
  });
});

