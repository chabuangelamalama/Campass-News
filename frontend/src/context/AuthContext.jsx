import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("campusnews_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("campusnews_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await api.login({ username, password });
    localStorage.setItem("campusnews_token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function signup(username, email, password) {
    const data = await api.signup({ username, email, password });
    localStorage.setItem("campusnews_token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("campusnews_token");
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin: user?.role === "admin",
    isEditor: user?.role === "editor" || user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}