const jwt = require("jsonwebtoken");

function signToken(payload, expiresIn = "7d") {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in the environment");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
