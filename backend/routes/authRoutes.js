const express = require("express");
const { register, login } = require("../controllers/authController");
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

module.exports = router;
