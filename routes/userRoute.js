const express = require("express");
const router = express.Router();
const {
  userRegister,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  userUpdatePassword,
  updateProfile,
  getAllUser,
  getSingleUserProfile,
  updateUserRole,
  deleteUser,
  getWishlist,
  getUserByid,
  sendWhatsappOtp,
  verifyWhatsappOtp,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/register", upload.single("image"),userRegister);
// router.route("/register").post(userRegister)
router.route("/login").post(userLogin);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, userUpdatePassword);
// router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.put("/me/update",upload.single("avtar"),isAuthenticatedUser, updateProfile);

router.route("/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getUserByid)
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);
router     
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUserProfile)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
router.route("/logout").get(userLogout);
router.route("/wishlist").get(isAuthenticatedUser, getWishlist)
router.post("/otp/send", sendWhatsappOtp);
router.post("/otp/verify", verifyWhatsappOtp);

module.exports = router;
