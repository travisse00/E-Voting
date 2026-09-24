const { verifyToken } = require("../utils/jwt");

function voterAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = verifyToken(token);
    if (payload.type !== "voter") return res.status(401).json({ error: "Not authenticated" });
    req.voter = payload; // { id, voterId }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = voterAuth;
