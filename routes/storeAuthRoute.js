const express = require("express");
const { storeLogin } = require("../controllers/storeAuthController");

const router = express.Router();
router.post("/login", storeLogin);

module.exports = router;
