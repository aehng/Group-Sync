import React, { createContext, useState, useCallback } from "react";
import { api } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/users/login/", { username, password });
      const { access: access, user: userData } = response.data;
      localStorage.setItem("access_token", access);
      setToken(access);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
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
    const { access, user: userData } = response.data;
    localStorage.setItem("access_token", access);
    setToken(access);
    setUser(userData);
    return userData;
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

const updateProfile = useCallback(async (username, email) => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.put("/api/users/profile/", {
      username,
      email,
    });
    const { user: userData } = response.data;
    setUser(userData);
    return userData;
  } catch (err) {
    setError(err.response?.data?.message || "Update failed");
    throw err;
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