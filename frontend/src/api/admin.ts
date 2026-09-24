import api from "./axios";

export interface AdminElection {
  _id: string;
  title: string;
  status: "draft" | "open" | "closed";
}

export async function listElections() {
  const { data } = await api.get<AdminElection[]>("/admin/elections");
  return data;
}

export async function createElection(title: string) {
  const { data } = await api.post<AdminElection>("/admin/elections", { title });
  return data;
}

export async function addPosition(electionId: string, title: string, order = 0) {
  const { data } = await api.post(`/admin/elections/${electionId}/positions`, { title, order });
  return data;
}

export async function addCandidate(positionId: string, name: string, photoUrl?: string) {
  const { data } = await api.post(`/admin/positions/${positionId}/candidates`, { name, photoUrl });
  return data;
}

export async function openElection(electionId: string) {
  const { data } = await api.patch<AdminElection>(`/admin/elections/${electionId}/open`);
  return data;
}

export async function closeElection(electionId: string) {
  const { data } = await api.patch<AdminElection>(`/admin/elections/${electionId}/close`);
  return data;
}

export async function getResults(electionId: string) {
  const { data } = await api.get(`/admin/elections/${electionId}/results`);
  return data;
}
