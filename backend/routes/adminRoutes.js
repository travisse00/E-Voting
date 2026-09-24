const express = require("express");
const {
  listElections,
  createElection,
  addPosition,
  addCandidate,
  openElection,
  closeElection,
  getResults,
} = require("../controllers/adminElectionController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.use(adminAuth()); // any authenticated admin

router.get("/elections", listElections);
router.post("/elections", createElection);
router.post("/elections/:electionId/positions", addPosition);
router.post("/positions/:positionId/candidates", addCandidate);
router.patch("/elections/:electionId/open", openElection);
router.patch("/elections/:electionId/close", closeElection);
router.get("/elections/:electionId/results", getResults);

module.exports = router;
