import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";
import { useRouter } from "expo-router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const extractUser = (data) => {
    if (!data) return null;
    if (data.user) return data.user;
    if (data.data?.user) return data.data.user;
    if (data.data) return data.data;
    if (Array.isArray(data)) return data[0] || null;
    return data;
  };

  const fetchUser = async (tok) => {
    if (!tok) {
      setUser(null);
      return null;
    }
    try {
      const res = await fetch(`${api.users}/me`, {
        headers: {
          Authorization: `Bearer ${tok}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        console.warn("/users/me failed", res.status);
        setUser(null);
        return null;
      }
      const data = await res.json();
      const u = extractUser(data);
      setUser(u || null);
      return u;
    } catch (e) {
      console.warn("fetchUser failed", e);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      setToken(t);
      setLoading(false);
      if (t) fetchUser(t);
    });
  }, []);

  // Refetch user when token changes
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(api.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };

    await AsyncStorage.setItem("token", data.token);
    setToken(data.token);
    fetchUser(data.token);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
    try {
      router.replace("/(auth)");
    } catch (e) {
      // ignore navigation failures
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
