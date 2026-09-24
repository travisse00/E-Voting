const mongoose = require("mongoose");

// Generic auto-increment counter. One document per sequence name (e.g. "voterId").
// We use findOneAndUpdate with $inc, which Mongo performs atomically, so two
// people registering at the exact same time can never get the same number.
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 1000 }, // start numbering from REG1001
});

module.exports = mongoose.model("Counter", counterSchema);
