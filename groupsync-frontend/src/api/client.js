import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Enhanced error interceptor that provides better error context
 */
const enhanceError = (error) => {
  // Add helpful properties to error object
  if (!error.response) {
    // Network error - no response from server
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out";
    } else if (error.message === "Network Error") {
      error.message = "Network error - cannot reach server";
    } else if (!error.message) {
      error.message = "Network error - please check your connection";
    }
  }
  return error;
};

// ai helped with refresh token logic
// Interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    error = enhanceError(error);
    const originalRequest = error.config;
    
    // If 401 error and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (refreshToken) {
          // Call refresh endpoint to get new access token
          const response = await axios.post(`${API_URL}/api/users/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          
          // Save new access token
          localStorage.setItem("access_token", access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);
