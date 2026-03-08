# Authentication Setup Guide for Frontend Developers

## Overview

This guide explains how to integrate authentication into the GroupSync React frontend application. It covers setting up the API client, using the AuthContext, protecting routes, and handling authentication in your components.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Client Setup](#api-client-setup)
3. [Using AuthContext](#using-authcontext)
4. [Protected Routes](#protected-routes)
5. [Making Authenticated Requests](#making-authenticated-requests)
6. [Error Handling](#error-handling)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
cd groupsync-frontend
npm install axios react-router-dom
```

### 2. Start Django Backend

In a separate terminal:

```bash
# From project root
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### 3. Start React Frontend

```bash
cd groupsync-frontend
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Test Authentication

1. Navigate to `http://localhost:3000/register`
2. Create a new account
3. You should be automatically logged in and redirected to the home page
4. Your profile is accessible at `/profile`

---

## API Client Setup

The API client is already configured in `/src/api/client.js`. It handles:

- Base URL configuration
- JWT token attachment to requests
- Automatic token refresh on 401 errors
- Request/response logging (in development)

### Configuration

```javascript
// src/api/client.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});
```

### Request Interceptor (Auto-attach Token)

The client automatically attaches the JWT access token to all requests:

```javascript
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
```

### Response Interceptor (Auto-refresh Token)

If a request fails with 401 (Unauthorized), the client automatically tries to refresh the token:

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          `${API_BASE_URL}/api/users/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**You don't need to handle token refresh manually!** The client does it automatically.

---

## Using AuthContext

The AuthContext provides global authentication state and methods.

### Accessing AuthContext

Use the `useAuth` hook in any component:

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <p>Welcome, {user.username}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Available Properties and Methods

| Property/Method | Type | Description |
|----------------|------|-------------|
| `user` | object \| null | Current authenticated user (null if not logged in) |
| `token` | string \| null | Current JWT access token |
| `loading` | boolean | True when authentication operation is in progress |
| `error` | string \| null | General error message (e.g., "Invalid credentials") |
| `fieldErrors` | object | Field-specific validation errors (e.g., `{username: ["Already exists"]}`) |
| `login(username, password)` | function | Log in a user (async, returns user object or throws) |
| `logout()` | function | Log out the current user (async) |
| `loadCurrentUser()` | function | Manually refresh user data from API (async) |
| `validateToken()` | function | Check if current token is valid (async, returns boolean) |

### User Object Structure

```javascript
{
  id: 1,
  username: "johndoe",
  email: "john@example.com",
  bio: "Software developer",
  profile_picture: "https://example.com/avatar.jpg"
}
```

---

## Protected Routes

Use the `PrivateRoute` component to protect pages that require authentication.

### Basic Usage

```javascript
// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Profile from './pages/Profile';
import GroupList from './pages/GroupList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <PrivateRoute>
              <GroupList />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

### How PrivateRoute Works

1. Checks if user is authenticated
2. Validates the JWT token with the backend
3. If valid: renders the protected component
4. If invalid: redirects to `/login` with return URL

```javascript
// src/components/PrivateRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading, validateToken } = useAuth();
  const location = useLocation();

  // Check token validity
  const [isValid, setIsValid] = React.useState(null);

  React.useEffect(() => {
    validateToken().then(setIsValid);
  }, [validateToken]);

  if (loading || isValid === null) {
    return <div>Loading...</div>;
  }

  if (!user || !isValid) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

### Redirect After Login

The login page can redirect users back to the page they were trying to access:

```javascript
// src/pages/Login.js
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (username, password) => {
    await login(username, password);

    // Redirect to the page they were trying to access, or home
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  // ... rest of component
}
```

---

## Making Authenticated Requests

### Using the API Client

The API client is already configured to attach tokens automatically. Just import and use it:

```javascript
import { api } from '../api/client';

// Get data (token attached automatically)
const response = await api.get('/api/groups/');
const groups = response.data;

// Post data
const response = await api.post('/api/groups/', {
  name: 'My Group',
  description: 'A cool group'
});

// Update data
const response = await api.put('/api/groups/1/', {
  name: 'Updated Name'
});

// Delete data
await api.delete('/api/groups/1/');
```

### Creating API Service Functions

Organize API calls into service functions:

```javascript
// src/api/groups.js
import { api } from './client';

export const groupsApi = {
  // Get all groups
  getAll: async () => {
    const response = await api.get('/api/groups/');
    return response.data;
  },

  // Get single group
  getById: async (id) => {
    const response = await api.get(`/api/groups/${id}/`);
    return response.data;
  },

  // Create group
  create: async (data) => {
    const response = await api.post('/api/groups/', data);
    return response.data;
  },

  // Update group
  update: async (id, data) => {
    const response = await api.put(`/api/groups/${id}/`, data);
    return response.data;
  },

  // Delete group
  delete: async (id) => {
    await api.delete(`/api/groups/${id}/`);
  },
};
```

### Using Service Functions in Components

```javascript
import { useState, useEffect } from 'react';
import { groupsApi } from '../api/groups';

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await groupsApi.getAll();
        setGroups(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {groups.map(group => (
        <li key={group.id}>{group.name}</li>
      ))}
    </ul>
  );
}
```

---

## Error Handling

### Displaying Field Errors (Form Validation)

The AuthContext provides `fieldErrors` for form validation:

```javascript
import { useAuth } from '../context/AuthContext';

function RegisterForm() {
  const { register, fieldErrors, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      // Registration successful, user is logged in
    } catch (error) {
      // Errors are automatically set in AuthContext
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
        {fieldErrors.username && (
          <p className="error">{fieldErrors.username[0]}</p>
        )}
      </div>

      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {fieldErrors.email && (
          <p className="error">{fieldErrors.email[0]}</p>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### Displaying General Errors

```javascript
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      // Error is automatically set in AuthContext
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* form fields */}
    </form>
  );
}
```

### Handling Network Errors

The AuthContext automatically provides user-friendly error messages for common scenarios:

- Connection timeout
- Network error (no internet)
- Server error (500)
- Unauthorized (401)
- Not found (404)

You can also handle errors in your API calls:

```javascript
try {
  const groups = await groupsApi.getAll();
  setGroups(groups);
} catch (error) {
  if (error.response?.status === 404) {
    setError("Groups not found");
  } else if (error.response?.status === 500) {
    setError("Server error. Please try again later.");
  } else if (!error.response) {
    setError("Network error. Check your connection.");
  } else {
    setError("An error occurred.");
  }
}
```

---

## Common Patterns

### Conditional Rendering Based on Auth State

```javascript
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>

      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/groups">Groups</Link>
          <button onClick={logout}>Logout</button>
          <span>Welcome, {user.username}</span>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
```

### Loading States

```javascript
function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <Spinner />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      {/* profile content */}
    </div>
  );
}
```

### Updating User Profile

```javascript
import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

function EditProfile() {
  const { user, loadCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    bio: user.bio || '',
    profile_picture: user.profile_picture || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/api/users/me/', formData);
      // Refresh user data in AuthContext
      await loadCurrentUser();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
        placeholder="Bio"
      />

      <input
        type="url"
        value={formData.profile_picture}
        onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
        placeholder="Profile Picture URL"
      />

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

---

## Troubleshooting

### "Network Error" or "CORS Error"

**Problem:** Frontend can't connect to backend.

**Solution:**

1. Verify Django backend is running: `python manage.py runserver`
2. Check CORS settings in `groupsync/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

3. Ensure `django-cors-headers` is installed and in `INSTALLED_APPS`

### "401 Unauthorized" on Every Request

**Problem:** Token is not being attached to requests.

**Solution:**

1. Check token exists: `console.log(localStorage.getItem('access_token'))`
2. Verify token is being attached in API client interceptor
3. Check token hasn't expired (tokens last 60 minutes)
4. Try logging out and back in

### "Token is invalid or expired"

**Problem:** Token has expired or is malformed.

**Solution:**

1. Log out and log back in
2. Check that refresh token mechanism is working
3. Verify `djangorestframework-simplejwt` is configured correctly in backend

### User is Null After Page Refresh

**Problem:** User state is lost on page reload.

**Solution:**

The AuthContext already handles this! It automatically loads the current user on mount if a token exists. If it's not working:

1. Check that `loadCurrentUser` is being called in `useEffect`
2. Verify token is stored correctly in localStorage
3. Check browser console for errors

### Redirect Loop (Login → Home → Login)

**Problem:** Protected routes keep redirecting to login.

**Solution:**

1. Check `PrivateRoute` is calling `validateToken()` correctly
2. Verify token is valid: manually test `/api/users/me/` endpoint
3. Check that `user` is being set in AuthContext after login

### 403 Forbidden Instead of 401 Unauthorized

**Problem:** Backend is returning 403 instead of 401.

**Solution:**

Check that you're using `IsAuthenticated` permission class, not `AllowAny` or custom permissions that return 403.

---

## Environment Variables

Create a `.env` file in `groupsync-frontend/`:

```
REACT_APP_API_URL=http://localhost:8000
```

For production:

```
REACT_APP_API_URL=https://your-app.render.com
```

**Note:** Restart the React app after changing `.env` files!

---

## Testing Authentication

### Manual Testing Checklist

- [ ] Register a new user
- [ ] Login with registered user
- [ ] View profile page
- [ ] Update profile information
- [ ] Access protected route (should work)
- [ ] Logout
- [ ] Try to access protected route (should redirect to login)
- [ ] Login again (should redirect back to protected route)
- [ ] Refresh page while logged in (should stay logged in)
- [ ] Wait 61 minutes, make request (token should auto-refresh)

### Automated Testing

See existing tests in `/src/api/*.test.js` and `/src/pages/*.test.js`.

Run tests:

```bash
npm test
```

---

## Additional Resources

- [Django REST Framework Authentication](https://www.django-rest-framework.org/api-guide/authentication/)
- [Simple JWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

## Support

For help with authentication integration:

- **Backend issues**: Contact Eli (Team A)
- **API documentation**: See [AUTH_API_DOCUMENTATION.md](AUTH_API_DOCUMENTATION.md)
- **Team Slack**: #groupsync-auth channel

---

**Last Updated:** March 7, 2026
