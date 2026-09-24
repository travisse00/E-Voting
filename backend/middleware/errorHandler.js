// Catches anything thrown/passed to next(err) that individual routes
// didn't already handle, so the server never leaks stack traces to clients.
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Something went wrong. Please try again."
      : err.message;

  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

module.exports = { errorHandler, notFound };
