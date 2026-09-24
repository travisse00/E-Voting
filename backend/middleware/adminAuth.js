const { verifyToken } = require("../utils/jwt");

// Usage: router.post("/x", adminAuth(), handler) for any admin,
// or adminAuth(["superadmin"]) to restrict to specific roles.
function adminAuth(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const payload = verifyToken(token);
      if (payload.type !== "admin") return res.status(401).json({ error: "Not authenticated" });
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.admin = payload; // { id, email, role }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = adminAuth;
