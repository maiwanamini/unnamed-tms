import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";
import { useRouter } from "expo-router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, []);

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
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    // navigate to the auth flow so the user is outside the app
    try {
      router.replace("/(auth)");
    } catch (e) {
      // router may not be available in some environments; ignore
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
