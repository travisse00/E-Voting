const express = require("express");
const { getMe } = require("../controllers/voterController");
const voterAuth = require("../middleware/voterAuth");

const router = express.Router();

router.get("/me", voterAuth, getMe);

module.exports = router;
