import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, AlertCircle, Vote } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <h1 className="flex items-center gap-2 border-b-2 border-ink pb-3 mb-8 font-serif text-xl font-bold">
        <Vote className="h-5 w-5 text-accent" />
        E-Voting
      </h1>

      <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold mb-1">Create your account</h2>
        <p className="text-sm text-ink-soft mb-5">
          You'll get a unique voter ID once you register.
        </p>

        <label className="block text-xs text-ink-soft mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full mb-4 rounded-md border border-line bg-paper py-3 px-3 text-base focus:border-accent focus:outline-none"
        />

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
          minLength={8}
          className="w-full mb-1 rounded-md border border-line bg-paper py-3 px-3 text-base focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-ink-soft mb-4">At least 8 characters.</p>

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
          <UserPlus className="h-4 w-4" />
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
