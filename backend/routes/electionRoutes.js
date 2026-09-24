const express = require("express");
const { listOpenElections, getBallot, submitVote } = require("../controllers/electionController");
const voterAuth = require("../middleware/voterAuth");
const { voteLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/open", voterAuth, listOpenElections);
router.get("/:electionId/ballot", voterAuth, getBallot);
router.post("/:electionId/vote", voterAuth, voteLimiter, submitVote);

module.exports = router;
