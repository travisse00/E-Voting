const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. "2026 General Election"
    status: { type: String, enum: ["draft", "open", "closed"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    openedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);
