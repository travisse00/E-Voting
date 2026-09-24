const rateLimit = require("express-rate-limit");

const makeLimiter = (max, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Stops brute-forcing registration/login and hammering vote submission
const registerLimiter = makeLimiter(10, "Too many registration attempts. Please try again later.");
const loginLimiter = makeLimiter(10, "Too many login attempts. Please try again later.");
const voteLimiter = makeLimiter(10, "Too many requests. Please try again later.");

module.exports = { registerLimiter, loginLimiter, voteLimiter };
