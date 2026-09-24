const express = require("express");
const { login } = require("../controllers/adminAuthController");
const { loginLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/login", loginLimiter, login);

module.exports = router;
