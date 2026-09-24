import { useEffect, useState } from "react";
import { LogOut, Plus, Lock, Unlock, BarChart3, ShieldCheck, AlertCircle } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  listElections,
  createElection,
  addPosition,
  addCandidate,
  openElection,
  closeElection,
  getResults,
  AdminElection,
} from "../api/admin";

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [posTitle, setPosTitle] = useState("");
  const [positions, setPositions] = useState<Record<string, { id: string; title: string }[]>>({});
  const [candName, setCandName] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  const refresh = () => listElections().then(setElections);

  useEffect(() => {
    refresh();
  }, []);

  const withError = async (fn: () => Promise<any>) => {
    setError("");
    try {
      await fn();
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await withError(async () => {
      await createElection(newTitle.trim());
      setNewTitle("");
      await refresh();
    });
  };

  const handleAddPosition = async (electionId: string) => {
    if (!posTitle.trim()) return;
    await withError(async () => {
      const pos = await addPosition(electionId, posTitle.trim());
      setPositions((prev) => ({
        ...prev,
        [electionId]: [...(prev[electionId] || []), { id: (pos as any)._id, title: posTitle.trim() }],
      }));
      setPosTitle("");
    });
  };

  const handleAddCandidate = async (positionId: string) => {
    const name = candName[positionId];
    if (!name?.trim()) return;
    await withError(async () => {
      await addCandidate(positionId, name.trim());
      setCandName((prev) => ({ ...prev, [positionId]: "" }));
    });
  };

  const handleOpen = (electionId: string) =>
    withError(async () => {
      await openElection(electionId);
      await refresh();
    });

  const handleClose = (electionId: string) =>
    withError(async () => {
      await closeElection(electionId);
      await refresh();
    });

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3 mb-8">
        <h1 className="flex items-center gap-2 font-serif text-xl font-bold">
          <ShieldCheck className="h-5 w-5 text-accent" />
          Admin Dashboard
        </h1>
        <div className="text-right">
          <p className="text-xs text-ink-soft">{admin?.username} · {admin?.role}</p>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-danger bg-white p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-2 rounded-lg border border-line bg-white p-4 shadow-sm sm:flex-row">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New election title, e.g. 2026 General Election"
          className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper"
        >
          <Plus className="h-4 w-4" />
          Create vote
        </button>
      </form>

      <div className="space-y-4">
        {elections.map((e) => {
          const isDraft = e.status === "draft";
          return (
            <div key={e._id} className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <span
                    className={`text-xs font-medium ${
                      e.status === "open"
                        ? "text-accent"
                        : e.status === "closed"
                        ? "text-danger"
                        : "text-ink-soft"
                    }`}
                  >
                    {e.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isDraft && (
                    <button
                      onClick={() => handleOpen(e._id)}
                      className="flex items-center gap-1 rounded-md border border-accent px-3 py-1.5 text-xs font-semibold text-accent"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      Open vote
                    </button>
                  )}
                  {e.status === "open" && (
                    <button
                      onClick={() => handleClose(e._id)}
                      className="flex items-center gap-1 rounded-md border border-danger px-3 py-1.5 text-xs font-semibold text-danger"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Close vote
                    </button>
                  )}
                  <button
                    onClick={() => {
                      getResults(e._id).then(setResults);
                      setExpanded(expanded === e._id ? null : e._id);
                    }}
                    className="flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    {expanded === e._id ? "Hide" : "Manage / Results"}
                  </button>
                </div>
              </div>

              {expanded === e._id && (
                <div className="mt-4 space-y-4 border-t border-line pt-4">
                  {isDraft ? (
                    <>
                      <div>
                        <p className="mb-2 text-xs font-semibold text-ink-soft">Add a post</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={posTitle}
                            onChange={(ev) => setPosTitle(ev.target.value)}
                            placeholder="e.g. President"
                            className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm"
                          />
                          <button
                            onClick={() => handleAddPosition(e._id)}
                            className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {(positions[e._id] || []).map((pos) => (
                        <div key={pos.id} className="rounded-md border border-line bg-paper p-3">
                          <p className="mb-2 text-xs font-semibold text-ink-soft">
                            Candidates for {pos.title}
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={candName[pos.id] || ""}
                              onChange={(ev) =>
                                setCandName((prev) => ({ ...prev, [pos.id]: ev.target.value }))
                              }
                              placeholder="Candidate name"
                              className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm"
                            />
                            <button
                              onClick={() => handleAddCandidate(pos.id)}
                              className="rounded-md border border-line px-3 py-2 text-sm font-semibold"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}

                      <p className="text-xs text-ink-soft">
                        Once you open this vote, posts and candidates lock in place - add everything
                        you need now, before opening.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-ink-soft">
                      This election is {e.status}, so its posts and candidates can no longer be
                      changed. {e.status === "open" ? "Close it" : "Create a new election"} if you need
                      a different ballot.
                    </p>
                  )}

                  {results && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-ink-soft">Live results</p>
                      <div className="space-y-3">
                        {results.map((r: any) => (
                          <div key={r.position}>
                            <p className="text-sm font-medium">{r.position}</p>
                            {r.candidates.map((c: any) => (
                              <div key={c.name} className="flex justify-between text-xs text-ink-soft">
                                <span>{c.name}</span>
                                <span>{c.votes}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
