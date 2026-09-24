import axios from "axios";

const api = axios.create({
  baseURL: "https://e-voting-2s3x.onrender.com/api",
});

// Attach the right token depending on whether this is an admin or voter route,
// so having both logged in at once (e.g. while testing) doesn't cross-wire calls.
api.interceptors.request.use((config) => {
  const isAdminRoute = (config.url || "").includes("/admin");
  const token = isAdminRoute
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("voterToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
