import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircleUserRound, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { getBallot, submitVote, Ballot as BallotType } from "../api/elections";

export default function Vote() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  const [ballot, setBallot] = useState<BallotType | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!electionId) return;
    getBallot(electionId)
      .then(setBallot)
      .catch((err) => setLoadError(err.response?.data?.error || "Could not load this ballot"));
  }, [electionId]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-5 py-10">
        <p className="flex items-center gap-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {loadError}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 rounded-md border border-line px-4 py-2 text-sm"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="mx-auto max-w-lg px-5 py-10">
        <p className="text-sm text-ink-soft">Loading ballot...</p>
      </div>
    );
  }

  const allSelected = ballot.ballot.every((b) => selections[b.position.id]);

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  };

  const handleFinalSubmit = async () => {
    if (!electionId) return;
    setSubmitting(true);
    setSubmitError("");
    const payload = Object.entries(selections).map(([positionId, candidateId]) => ({
      positionId,
      candidateId,
    }));
    try {
      await submitVote(electionId, payload);
      // Per the required flow: no results here, just confirm and send them back.
      navigate("/dashboard", { state: { voteSuccess: true } });
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || "Could not submit your vote");
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirming) {
    return (
      <div className="mx-auto max-w-lg px-5 py-10">
        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold mb-4">Confirm your vote</h2>

          <div className="space-y-2">
            {ballot.ballot.map((b) => {
              const cand = b.candidates.find((c) => c.id === selections[b.position.id]);
              return (
                <div
                  key={b.position.id}
                  className="flex justify-between border-t border-line py-3 text-sm first:border-t-0"
                >
                  <span className="text-ink-soft">{b.position.title}</span>
                  <span className="font-semibold">{cand?.name}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2 rounded-md border border-dashed border-line bg-paper p-3 text-sm text-ink-soft">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            Once submitted, your vote is final and cannot be changed.
          </div>

          {submitError && (
            <p className="mt-3 flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </p>
          )}

          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="mt-5 w-full rounded-md bg-ink py-3 font-semibold text-paper disabled:opacity-40"
          >
            {submitting ? "Submitting..." : "Confirm & Submit"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={submitting}
            className="mt-2 w-full rounded-md border border-line py-3 font-semibold text-ink-soft"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <h2 className="font-serif text-xl font-semibold mb-1">{ballot.title}</h2>
      <p className="text-sm text-ink-soft mb-6">Choose one candidate per post.</p>

      <div className="rounded-lg border border-line bg-white p-6 shadow-sm divide-y divide-line">
        {ballot.ballot.map((b) => (
          <fieldset key={b.position.id} className="py-4 first:pt-0 last:pb-0">
            <legend className="mb-3 text-sm font-semibold text-ink-soft">{b.position.title}</legend>
            <div className="space-y-2">
              {b.candidates.map((c) => {
                const selected = selections[b.position.id] === c.id;
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 transition ${
                      selected ? "border-accent bg-accent-soft" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name={b.position.id}
                      checked={selected}
                      onChange={() => handleSelect(b.position.id, c.id)}
                      className="sr-only"
                    />
                    <CircleUserRound className="h-[18px] w-[18px] text-ink-soft shrink-0" />
                    <span className="text-sm font-medium">{c.name}</span>
                    {selected && <CheckCircle2 className="ml-auto h-[18px] w-[18px] text-accent" />}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <button
        disabled={!allSelected}
        onClick={() => setConfirming(true)}
        className="mt-5 w-full rounded-md bg-ink py-3 font-semibold text-paper disabled:opacity-40"
      >
        Review & Submit
      </button>
    </div>
  );
}
