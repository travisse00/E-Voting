const Voter = require("../models/Voter");

async function getMe(req, res, next) {
  try {
    const voter = await Voter.findById(req.voter.id).select("-passwordHash");
    if (!voter) return res.status(404).json({ error: "Voter not found" });
    res.json(voter);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe };
