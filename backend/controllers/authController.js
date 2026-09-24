const bcrypt = require("bcryptjs");
const Voter = require("../models/Voter");
const generateVoterId = require("../utils/generateVoterId");
const { signToken } = require("../utils/jwt");

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await Voter.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const voterId = await generateVoterId();
    const passwordHash = await bcrypt.hash(password, 12);

    const voter = await Voter.create({
      voterId,
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    const token = signToken({ type: "voter", id: voter._id, voterId: voter.voterId });

    res.status(201).json({
      token,
      voter: { id: voter._id, voterId: voter.voterId, username: voter.username, email: voter.email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const voter = await Voter.findOne({ email: email.toLowerCase().trim() });
    if (!voter) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, voter.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ type: "voter", id: voter._id, voterId: voter.voterId });

    res.json({
      token,
      voter: { id: voter._id, voterId: voter.voterId, username: voter.username, email: voter.email },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
