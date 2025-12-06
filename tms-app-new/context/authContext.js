// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import useSWR from "swr";
import { api } from "../lib/api";
import fetcher from "../lib/_fetcher";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // Load token from storage on app start
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

  // Automatically fetch logged‑in user if token exists
  const { data: user, mutate: refreshUser } = useSWR(
    token ? [`${api.users}/me`, token] : null,
    ([url, token]) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.json()
      )
  );

  const login = async (email, password) => {
    const res = await fetch(api.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());

    if (!res.token) throw new Error("Invalid credentials");

    await SecureStore.setItemAsync("token", res.token);
    setToken(res.token);
    refreshUser();
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    refreshUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, loading: !user && !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
