import React, { createContext, useState, useCallback, useEffect} from "react";
import { api } from "../api/client";

/**
 * AuthContext - Global Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Manages JWT tokens, user data, and authentication operations.
 * 
 * @example
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * @example
 * // Access auth state in components
 * import { useAuth } from './context/AuthContext';
 * 
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *   // Use authentication...
 * }
 */
export const AuthContext = createContext();

/**
 * Custom hook to access AuthContext
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 * 
 * @example
 * const { user, login, logout, loading } = useAuth();
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * 
 * Provides authentication context to all child components.
 * Manages JWT token storage, user state, and authentication operations.
 * 
 * Features:
 * - Automatic token refresh on mount (if token exists in localStorage)
 * - User-friendly error messages for authentication failures
 * - Field-level validation error handling
 * - Loading states for async operations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * 
 * @example
 * <AuthProvider>
 *   <Router>
 *     <App />
 *   </Router>
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  // State management
  /** @type {[Object|null, Function]} Current authenticated user object */
  const [user, setUser] = useState(null);
  
  /** @type {[string|null, Function]} JWT access token */
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  
  /** @type {[boolean, Function]} Loading state for async operations */
  const [loading, setLoading] = useState(false);
  
  /** @type {[string|null, Function]} General error message */
  const [error, setError] = useState(null);
  
  /** @type {[Object, Function]} Field-specific validation errors */
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Extract user-friendly error messages from API response
   * 
   * Handles various error scenarios:
   * - Network errors (connection timeout, no internet)
   * - HTTP status codes (401, 404, 500)
   * - Django REST Framework validation errors
   * 
   * @param {Error} err - Axios error object
   * @returns {Object} Object containing message and fieldErrors
   * @returns {string} returns.message - General error message
   * @returns {Object} returns.fieldErrors - Field-specific validation errors
   * 
   * @private
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


  /**
   * Load current user data from API
   * 
   * Fetches user profile from backend using stored JWT token.
   * Automatically called on component mount if token exists.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * // Manually refresh user data
   * await loadCurrentUser();
   */
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


  /**
   * Login user with username and password
   * 
   * Authenticates user and stores JWT tokens in localStorage.
   * Sets user state and token state on success.
   * 
   * @async
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object on success
   * @throws {Error} Authentication error with message and field errors
   * 
   * @example
   * try {
   *   const user = await login('johndoe', 'password123');
   *   console.log('Logged in:', user.username);
   * } catch (error) {
   *   console.error('Login failed:', error);
   * }
   */
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

  /**
   * Logout current user
   * 
   * Blacklists refresh token on backend and clears all auth state.
   * Removes tokens from localStorage and resets user state.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * await logout();
   * // User is now logged out, navigate to login page
   */
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

  /**
   * Validate current JWT token
   * 
   * Checks if the current token is still valid by making a request to /api/users/me/.
   * Used by PrivateRoute to verify authentication before rendering protected pages.
   * 
   * @async
   * @returns {Promise<boolean>} True if token is valid, false otherwise
   * 
   * @example
   * const isValid = await validateToken();
   * if (!isValid) {
   *   navigate('/login');
   * }
   */
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

/**
 * Register a new user account
 * 
 * Creates new user and automatically logs them in.
 * Stores JWT tokens in localStorage and sets user state.
 * 
 * @async
 * @param {string} username - Desired username (unique, 3-150 chars)
 * @param {string} email - Email address (unique, valid format)
 * @param {string} password - Password (min 8 chars)
 * @param {string} password_confirm - Password confirmation (must match password)
 * @returns {Promise<Object>} User object on success
 * @throws {Error} Registration error with message and field errors
 * 
 * @example
 * try {
 *   const user = await register('johndoe', 'john@example.com', 'Pass123!', 'Pass123!');
 *   console.log('Registered:', user.username);
 * } catch (error) {
 *   if (error.response?.data?.username) {
 *     console.error('Username error:', error.response.data.username[0]);
 *   }
 * }
 */
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

/**
 * Clear all error messages
 * 
 * Resets both general error and field-specific errors.
 * Useful for clearing errors before a new operation or when dismissing error messages.
 * 
 * @returns {void}
 * 
 * @example
 * clearErrors();
 * // All error states are now null/empty
 */
const clearErrors = useCallback(() => {
  setError(null);
  setFieldErrors({});
}, []);

/**
 * Update user profile information
 * 
 * Updates username and/or email for the current authenticated user.
 * Automatically refreshes user state with updated data.
 * 
 * @async
 * @param {string} username - New username (optional)
 * @param {string} email - New email (optional)
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} Update error with message and field errors
 * 
 * @example
 * try {
 *   const updatedUser = await updateProfile('newusername', 'newemail@example.com');
 *   console.log('Profile updated:', updatedUser);
 * } catch (error) {
 *   console.error('Update failed:', error);
 * }
 */
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


  /**
   * Context value object
   * 
   * All properties and methods exposed by AuthContext.
   * Access these using the useAuth() hook.
   * 
   * @typedef {Object} AuthContextValue
   * @property {Object|null} user - Current authenticated user object (null if not logged in)
   * @property {string|null} token - Current JWT access token (null if not logged in)
   * @property {boolean} loading - True when authentication operation in progress
   * @property {string|null} error - General error message (null if no error)
   * @property {Object} fieldErrors - Field-specific validation errors (empty object if no errors)
   * @property {Function} login - Login user with username and password
   * @property {Function} logout - Logout current user
   * @property {Function} register - Register new user account
   * @property {Function} updateProfile - Update user profile information
   * @property {Function} clearErrors - Clear all error messages
   * @property {Function} validateToken - Check if current token is valid
   * @property {boolean} isAuthenticated - True if user is logged in (has valid token)
   */
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