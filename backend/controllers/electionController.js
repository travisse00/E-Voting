const mongoose = require("mongoose");
const Election = require("../models/Election");
const Position = require("../models/Position");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

// List every open election, flagging whether this voter has already voted in it
async function listOpenElections(req, res, next) {
  try {
    const elections = await Election.find({ status: "open" }).sort({ createdAt: -1 });

    const results = await Promise.all(
      elections.map(async (e) => {
        const positions = await Position.find({ electionId: e._id });
        const positionIds = positions.map((p) => p._id);
        const existingVote = positionIds.length
          ? await Vote.findOne({ voterId: req.voter.id, positionId: { $in: positionIds } })
          : null;
        return {
          id: e._id,
          title: e.title,
          hasVoted: Boolean(existingVote),
          positionCount: positions.length,
        };
      })
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
}

// Get the ballot (positions + candidates) for one open election
async function getBallot(req, res, next) {
  try {
    const { electionId } = req.params;
    if (!mongoose.isValidObjectId(electionId)) {
      return res.status(400).json({ error: "Invalid election id" });
    }

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: "Election not found" });
    if (election.status !== "open") return res.status(403).json({ error: "This election is not open" });

    const positions = await Position.find({ electionId }).sort({ order: 1 });
    const positionIds = positions.map((p) => p._id);

    const alreadyVoted = positionIds.length
      ? await Vote.findOne({ voterId: req.voter.id, positionId: { $in: positionIds } })
      : null;
    if (alreadyVoted) return res.status(403).json({ error: "You have already voted in this election" });

    const candidates = await Candidate.find({ positionId: { $in: positionIds } });

    const ballot = positions.map((pos) => ({
      position: { id: pos._id, title: pos.title },
      candidates: candidates
        .filter((c) => c.positionId.toString() === pos._id.toString())
        .map((c) => ({ id: c._id, name: c.name, photoUrl: c.photoUrl })),
    }));

    res.json({ electionId: election._id, title: election.title, ballot });
  } catch (err) {
    next(err);
  }
}

// Submit selections for every position in one election, atomically
async function submitVote(req, res, next) {
  const { electionId } = req.params;
  const { selections } = req.body; // [{ positionId, candidateId }, ...]

  if (
    !mongoose.isValidObjectId(electionId) ||
    !Array.isArray(selections) ||
    selections.length === 0 ||
    selections.some(
      (s) => !mongoose.isValidObjectId(s.positionId) || !mongoose.isValidObjectId(s.candidateId)
    )
  ) {
    return res.status(400).json({ error: "Valid electionId and selections are required" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const election = await Election.findById(electionId).session(session);
    if (!election) throw Object.assign(new Error("Election not found"), { status: 404 });
    if (election.status !== "open") {
      throw Object.assign(new Error("This election is not open"), { status: 403 });
    }

    const positions = await Position.find({ electionId }).session(session);
    const positionIds = positions.map((p) => p._id.toString());

    // Every submitted position must actually belong to this election
    const validSelections = selections.every((s) => positionIds.includes(s.positionId));
    if (!validSelections) {
      throw Object.assign(new Error("Selections do not match this election's ballot"), { status: 400 });
    }

    const existingVote = await Vote.findOne({
      voterId: req.voter.id,
      positionId: { $in: positions.map((p) => p._id) },
    }).session(session);
    if (existingVote) {
      throw Object.assign(new Error("You have already voted in this election"), { status: 403 });
    }

    const voteDocs = selections.map((s) => ({
      voterId: req.voter.id,
      electionId,
      positionId: s.positionId,
      candidateId: s.candidateId,
    }));

    await Vote.insertMany(voteDocs, { session });

    await session.commitTransaction();
    session.endSession();

    // Deliberately no tallies/results in this response - the voter only
    // gets a confirmation, per the required flow.
    res.json({ message: "Vote recorded successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}

module.exports = { listOpenElections, getBallot, submitVote };
