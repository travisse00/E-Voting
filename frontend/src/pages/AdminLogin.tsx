import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <h1 className="flex items-center gap-2 border-b-2 border-ink pb-3 mb-8 font-serif text-xl font-bold">
        <ShieldCheck className="h-5 w-5 text-accent" />
        Admin Login
      </h1>

      <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-6 shadow-sm">
        <label className="block text-xs text-ink-soft mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 rounded-md border border-line bg-paper py-3 px-3 text-base focus:border-accent focus:outline-none"
        />

        <label className="block text-xs text-ink-soft mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 rounded-md border border-line bg-paper py-3 px-3 text-base focus:border-accent focus:outline-none"
        />

        {error && (
          <p className="mb-2 flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 font-semibold text-paper disabled:opacity-40"
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="mt-4 text-center text-xs text-ink-soft">
          Admin accounts are created with the createAdmin script, not this form.
        </p>
      </form>
    </div>
  );
}
