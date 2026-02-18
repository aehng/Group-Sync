import React, { createContext, useState, useCallback, useEffect} from "react";
import { api } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const loadCurrentUser = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/users/me/");
      setUser(response.data.user ?? response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [token]);


  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);


  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/users/login/", { username, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setToken(access);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err.response?.data || { general: "Login failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/users/logout/", { refresh: localStorage.getItem("refresh_token") });
    } catch (err) {
      // Ignore errors on logout
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

const register = useCallback(async (username, email, password, password_confirm) => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.post("/api/users/register/", {
      username,
      email,
      password,
      password_confirm,
    });
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setToken(access);
    setUser(userData);
    return userData;
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
    throw err.response?.data || { general: "Registration failed" };
  } finally {
    setLoading(false);
  }
}, []);

const updateProfile = useCallback(async (username, email) => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.put("/api/users/me/", {username,email});
    console.log("updateProfile: success", response.status, response.data);
    const userData = response.data.user ?? response.data;
    setUser(userData);
    return userData;
  } catch (err) {
    console.log("updateProfile: caught error", err);
    console.log("err.response?.data:", err.response?.data);
    setError(err.response?.data?.message || "Update failed");
    throw err.response?.data || { general: "Update failed" };
  } finally {
    setLoading(false);
  }
}, []);


  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};