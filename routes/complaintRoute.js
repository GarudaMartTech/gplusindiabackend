const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createComplaint,
  myComplaints,
  getComplaintById,
  allComplaints,
  updateStatus,
  submitFeedback,
  assignComplaintToStore ,
} = require("../controllers/complaintController");


const { isAuthenticatedUser, authorizeRoles,isAuthenticatedUserOrStore, } = require("../middleware/auth");

// CREATE COMPLAINT
router.post(
  "/",
  isAuthenticatedUser,
  upload.array("images", 5),
  createComplaint
);

// MY COMPLAINTS
router.get("/my", isAuthenticatedUser, myComplaints);

// FEEDBACK (ALAG ROUTE)
router.post(
  "/:id/feedback",
  isAuthenticatedUser,
  (req, res, next) => {
    // console.log(" BACKEND: FEEDBACK ROUTE HIT");
    // console.log(" Params ID:", req.params.id);
    // console.log(" Body:", req.body);
    next();
  },
  submitFeedback
);

// SINGLE COMPLAINT
router.get("/:id", isAuthenticatedUserOrStore, getComplaintById);

// ADMIN
router.get(
  "/admin/complaints",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  allComplaints
);
router.put(
  "/:complaintId/assign",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  assignComplaintToStore
);

router.put("/:id/status", isAuthenticatedUserOrStore, updateStatus);

module.exports = router;
