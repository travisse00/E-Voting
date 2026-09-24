require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const voterRoutes = require("./routes/voterRoutes");
const electionRoutes = require("./routes/electionRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// Required if you're behind a reverse proxy / load balancer (Render, Railway,
// Heroku, Nginx, etc.) so rate limiting and req.ip work off the real client IP.
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Lock CORS down to your actual frontend origin in production.
// FRONTEND_URL can be a comma-separated list if you have more than one.
const allowedOrigins = ("https://e-voting-theta-seven.vercel.app/")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize()); // strips $ and . operators from user input to block NoSQL injection

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);           // voter register/login
app.use("/api/voter", voterRoutes);          // voter dashboard (me)
app.use("/api/elections", electionRoutes);   // voter-facing ballot + vote
app.use("/api/admin/auth", adminAuthRoutes); // admin login
app.use("/api/admin", adminRoutes);          // admin election management

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// Graceful shutdown so in-flight requests (and the DB connection) close cleanly
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (server) server.close(() => process.exit(0));
});
