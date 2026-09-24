const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  title: { type: String, required: true }, // e.g. "President"
  order: { type: Number, default: 0 }, // controls display order on the ballot
});

// A position title only needs to be unique within its own election
positionSchema.index({ electionId: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Position", positionSchema);
