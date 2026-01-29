const express = require("express");
const router = express.Router();

/* CONTROLLER IMPORT */
const {
  storeLogin,
  getAssignedComplaints,
  createStore,
  storeDashboard,
  getAllStores,
} = require("../controllers/storeController");

/* MIDDLEWARE */
const {
  isAuthenticatedUser,
  authorizeRoles,
  isAuthenticatedStore,
  authorizeStore,
} = require("../middleware/auth");

/* =========================
   STORE ROUTES
========================= */

// ADMIN → CREATE STORE
router.post(
  "/create",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createStore
);

// STORE LOGIN
router.post("/login", storeLogin);

// STORE → ASSIGNED COMPLAINTS
router.get(
  "/complaints",
  isAuthenticatedStore,
  // authorizeStore,
  getAssignedComplaints
);

// ADMIN → GET ALL STORES
router.get(
  "/",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllStores
);

// STORE → DASHBOARD
router.get(
  "/dashboard",
  isAuthenticatedStore,
  // authorizeStore,
  storeDashboard
);

module.exports = router;
