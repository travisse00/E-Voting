const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true }, // e.g. "REG1001"
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);
