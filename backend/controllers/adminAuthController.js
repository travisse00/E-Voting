const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { signToken } = require("../utils/jwt");

// No admin self-registration route on purpose — admins are created with the
// scripts/createAdmin.js CLI script so random people can't sign up as admins.
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ type: "admin", id: admin._id, email: admin.email, role: admin.role });

    res.json({
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
