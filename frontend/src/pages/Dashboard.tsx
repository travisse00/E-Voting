import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IdCard, LogOut, CheckCircle2, ArrowRight, CheckCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getOpenElections, OpenElection } from "../api/elections";

export default function Dashboard() {
  const { voter, logout } = useAuth();
  const location = useLocation();
  const [elections, setElections] = useState<OpenElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(
    Boolean((location.state as any)?.voteSuccess)
  );

  useEffect(() => {
    getOpenElections()
      .then(setElections)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3 mb-8">
        <h1 className="font-serif text-xl font-bold">Your Dashboard</h1>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {showSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-accent bg-accent-soft p-4 text-sm text-accent">
          <CheckCheck className="h-5 w-5 shrink-0" />
          <span className="flex-1">Your vote was recorded successfully.</span>
          <button onClick={() => setShowSuccess(false)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-line bg-white p-5 shadow-sm">
        <IdCard className="h-8 w-8 text-accent" />
        <div>
          <p className="text-xs text-ink-soft">Your voter ID</p>
          <p className="font-serif text-lg font-semibold">{voter?.voterId}</p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink-soft">Open votes</h2>

      {loading && <p className="text-sm text-ink-soft">Loading...</p>}
      {!loading && elections.length === 0 && (
        <p className="text-sm text-ink-soft">No votes are open right now.</p>
      )}

      <div className="space-y-3">
        {elections.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-ink-soft">{e.positionCount} posts</p>
            </div>
            {e.hasVoted ? (
              <span className="flex items-center gap-1 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" />
                Voted
              </span>
            ) : (
              <Link
                to={`/vote/${e.id}`}
                className="flex items-center gap-1 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper"
              >
                Vote
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
