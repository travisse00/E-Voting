import { createContext, useContext, useState, ReactNode } from "react";
import { loginAdmin } from "../api/auth";

interface AdminInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AdminAuthContextValue {
  admin: AdminInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const { token, admin } = await loginAdmin(email, password);
    localStorage.setItem("adminToken", token);
    localStorage.setItem("admin", JSON.stringify(admin));
    setAdmin(admin);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
