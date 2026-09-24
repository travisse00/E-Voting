import api from "./axios";

export interface Voter {
  id: string;
  voterId: string;
  username: string;
  email: string;
}

export async function registerVoter(username: string, email: string, password: string) {
  const { data } = await api.post<{ token: string; voter: Voter }>("/auth/register", {
    username,
    email,
    password,
  });
  return data;
}

export async function loginVoter(email: string, password: string) {
  const { data } = await api.post<{ token: string; voter: Voter }>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function loginAdmin(email: string, password: string) {
  const { data } = await api.post<{
    token: string;
    admin: { id: string; username: string; email: string; role: string };
  }>("/admin/auth/login", { email, password });
  return data;
}
