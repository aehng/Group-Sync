import React, { createContext, useState, useCallback, useEffect} from "react";
import { api } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Extract a user-friendly error message from API response
   */
  const getApiErrorMessage = (err) => {
    // Handle network errors (no response from server)
    if (!err.response) {
      if (err.code === "ECONNABORTED") {
        return {
          message: "Request timed out. Please check your connection and try again.",
          fieldErrors: {}
        };
      }
      return {
        message: "Network error. Please check your internet connection.",
        fieldErrors: {}
      };
    }

    const data = err.response?.data;
    const status = err.response?.status;

    // Handle different status codes
    if (status === 401) {
      return {
        message: "Invalid username or password. Please try again.",
        fieldErrors: {}
      };
    }
    if (status === 404) {
      return {
        message: "User or resource not found.",
        fieldErrors: {}
      };
    }
    if (status === 500) {
      return {
        message: "Server error. Please try again later.",
        fieldErrors: {}
      };
    }

    // Extract field-specific errors (for validation errors)
    const fieldErrors = {};
    if (data && typeof data === "object") {
      // Handle Django REST Framework's format
      for (const [key, value] of Object.entries(data)) {
        // Skip non-field errors for now, handle separately
        if (key === "non_field_errors" || key === "detail" || key === "message") {
          continue;
        }
        fieldErrors[key] = value;
      }
    }

    // Extract general message
    let message = null;
    if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.detail) {
      message = data.detail;
    } else if (Array.isArray(data?.non_field_errors) && data?.non_field_errors.length > 0) {
      message = data.non_field_errors[0];
    }

    return {
      message: message || "An error occurred. Please try again.",
      fieldErrors
    };
  };



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
    setFieldErrors({});
    try {
      const response = await api.post("/api/users/login/", { username: username.trim(), password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setToken(access);
      setUser(userData);
      return userData;
    } catch (err) {
      const { message, fieldErrors: fErrors } = getApiErrorMessage(err);
      setError(message);
      setFieldErrors(fErrors);
      throw err;
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

  // helper used by PrivateRoute (or any consumer) to ensure the current token is still
  // valid. returns true when valid, false if it failed and user was logged out.
  const validateToken = useCallback(async () => {
    if (!token) return false;
    try {
      await api.get("/api/users/me/");
      return true;
    } catch (err) {
      // anything wrong with the token or server, clear the auth state
      logout();
      return false;
    }
  }, [token, logout]);

const register = useCallback(async (username, email, password, password_confirm) => {
  setLoading(true);
  setError(null);
  setFieldErrors({});
  try {
    const response = await api.post("/api/users/register/", {
      username: username.trim(),
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
    const { message, fieldErrors: fErrors } = getApiErrorMessage(err);
    setError(message);
    setFieldErrors(fErrors);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

const clearErrors = useCallback(() => {
  setError(null);
  setFieldErrors({});
}, []);

const updateProfile = useCallback(async (username, email) => {
  setLoading(true);
  setError(null);
  setFieldErrors({});
  try {
    const response = await api.put("/api/users/me/", {username, email});
    const userData = response.data.user ?? response.data;
    setUser(userData);
    return userData;
  } catch (err) {
    const { message, fieldErrors: fErrors } = getApiErrorMessage(err);
    setError(message);
    setFieldErrors(fErrors);
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
    fieldErrors,
    login,
    logout,
    register,
    updateProfile,
    clearErrors,
    validateToken,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};