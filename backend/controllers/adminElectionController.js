const mongoose = require("mongoose");
const Election = require("../models/Election");
const Position = require("../models/Position");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

async function listElections(req, res, next) {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    next(err);
  }
}

async function createElection(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

    const election = await Election.create({ title: title.trim(), createdBy: req.admin.id });
    res.status(201).json(election);
  } catch (err) {
    next(err);
  }
}

async function addPosition(req, res, next) {
  try {
    const { electionId } = req.params;
    const { title, order } = req.body;
    if (!mongoose.isValidObjectId(electionId)) return res.status(400).json({ error: "Invalid election id" });
    if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: "Election not found" });
    if (election.status !== "draft") {
      return res.status(400).json({
        error:
          "Positions can only be added while the election is in draft. Voters have already started voting, or it's closed - adding a post now would let some voters miss it. Create a new election instead.",
      });
    }

    const position = await Position.create({ electionId, title: title.trim(), order: order || 0 });
    res.status(201).json(position);
  } catch (err) {
    next(err);
  }
}

async function addCandidate(req, res, next) {
  try {
    const { positionId } = req.params;
    const { name, photoUrl } = req.body;
    if (!mongoose.isValidObjectId(positionId)) return res.status(400).json({ error: "Invalid position id" });
    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });

    const position = await Position.findById(positionId);
    if (!position) return res.status(404).json({ error: "Position not found" });

    const election = await Election.findById(position.electionId);
    if (!election) return res.status(404).json({ error: "Election not found" });
    if (election.status !== "draft") {
      return res.status(400).json({
        error:
          "Candidates can only be added while the election is in draft. Voters have already started voting, or it's closed. Create a new election instead.",
      });
    }

    const candidate = await Candidate.create({ positionId, name: name.trim(), photoUrl });
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
}

async function openElection(req, res, next) {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: "Election not found" });
    if (election.status !== "draft") {
      return res.status(400).json({ error: `Election is already ${election.status}, cannot reopen it` });
    }

    const positions = await Position.find({ electionId });
    if (positions.length === 0) {
      return res.status(400).json({ error: "Add at least one position before opening the election" });
    }
    const candidateCount = await Candidate.countDocuments({
      positionId: { $in: positions.map((p) => p._id) },
    });
    if (candidateCount === 0) {
      return res.status(400).json({ error: "Add at least one candidate before opening the election" });
    }

    election.status = "open";
    election.openedAt = new Date();
    await election.save();
    res.json(election);
  } catch (err) {
    next(err);
  }
}

async function closeElection(req, res, next) {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: "Election not found" });
    if (election.status !== "open") {
      return res.status(400).json({ error: `Election is ${election.status}, not open - nothing to close` });
    }

    election.status = "closed";
    election.closedAt = new Date();
    await election.save();
    res.json(election);
  } catch (err) {
    next(err);
  }
}

async function getResults(req, res, next) {
  try {
    const { electionId } = req.params;
    if (!mongoose.isValidObjectId(electionId)) return res.status(400).json({ error: "Invalid election id" });

    const positions = await Position.find({ electionId }).sort({ order: 1 });
    const positionIds = positions.map((p) => p._id);
    const candidates = await Candidate.find({ positionId: { $in: positionIds } });

    const tally = await Vote.aggregate([
      { $match: { positionId: { $in: positionIds } } },
      { $group: { _id: { positionId: "$positionId", candidateId: "$candidateId" }, count: { $sum: 1 } } },
    ]);

    const results = positions.map((pos) => ({
      position: pos.title,
      candidates: candidates
        .filter((c) => c.positionId.toString() === pos._id.toString())
        .map((c) => {
          const entry = tally.find(
            (t) =>
              t._id.positionId.toString() === pos._id.toString() &&
              t._id.candidateId.toString() === c._id.toString()
          );
          return { name: c.name, votes: entry ? entry.count : 0 };
        }),
    }));

    res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listElections,
  createElection,
  addPosition,
  addCandidate,
  openElection,
  closeElection,
  getResults,
};
