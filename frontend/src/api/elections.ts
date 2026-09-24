import api from "./axios";

export interface OpenElection {
  id: string;
  title: string;
  hasVoted: boolean;
  positionCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  photoUrl?: string;
}

export interface BallotPosition {
  position: { id: string; title: string };
  candidates: Candidate[];
}

export interface Ballot {
  electionId: string;
  title: string;
  ballot: BallotPosition[];
}

export async function getOpenElections() {
  const { data } = await api.get<OpenElection[]>("/elections/open");
  return data;
}

export async function getBallot(electionId: string) {
  const { data } = await api.get<Ballot>(`/elections/${electionId}/ballot`);
  return data;
}

export async function submitVote(
  electionId: string,
  selections: { positionId: string; candidateId: string }[]
) {
  const { data } = await api.post<{ message: string }>(`/elections/${electionId}/vote`, {
    selections,
  });
  return data;
}
