const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photoUrl: { type: String },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position", required: true },
});

module.exports = mongoose.model("Candidate", candidateSchema);
