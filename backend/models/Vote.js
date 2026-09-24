const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    voterId: { type: mongoose.Schema.Types.ObjectId, ref: "Voter", required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position", required: true },
  },
  { timestamps: true }
);

// Stops a voter casting a second vote for the same post — the actual
// double-voting guard, enforced at the database level.
voteSchema.index({ voterId: 1, positionId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
