import { createContext, useContext, useState, ReactNode } from "react";
import { Voter, loginVoter, registerVoter } from "../api/auth";

interface AuthContextValue {
  voter: Voter | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [voter, setVoter] = useState<Voter | null>(() => {
    const stored = localStorage.getItem("voter");
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (token: string, voterData: Voter) => {
    localStorage.setItem("voterToken", token);
    localStorage.setItem("voter", JSON.stringify(voterData));
    setVoter(voterData);
  };

  const login = async (email: string, password: string) => {
    const { token, voter } = await loginVoter(email, password);
    persist(token, voter);
  };

  const register = async (username: string, email: string, password: string) => {
    const { token, voter } = await registerVoter(username, email, password);
    persist(token, voter);
  };

  const logout = () => {
    localStorage.removeItem("voterToken");
    localStorage.removeItem("voter");
    setVoter(null);
  };

  return (
    <AuthContext.Provider value={{ voter, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
