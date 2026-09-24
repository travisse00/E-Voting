const Counter = require("../models/Counter");

// Atomically bumps the "voterId" counter and returns the next value,
// formatted as REG1001, REG1002, etc.
async function generateVoterId() {
  const counter = await Counter.findOneAndUpdate(
    { name: "voterId" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `REG${counter.value}`;
}

module.exports = generateVoterId;
