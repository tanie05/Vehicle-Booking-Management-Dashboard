import { createContext, useContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../sockets";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    if (token && saved) {
      const u = JSON.parse(saved);
      setUser(u);
      connectSocket(token);
    }
    setLoading(false);
  }, []);

  const saveAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    connectSocket(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
