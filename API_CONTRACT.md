# GroupSync API Contract - Authentication

**Owner:** Team A (Authentication)  
**Last Updated:** January 13, 2026  
**Status:** Draft

---

## Base URL
- **Development:** `http://localhost:8000/api`
- **Production:** `https://groupsync.onrender.com/api` (TBD Week 11)

---

## Authentication

All protected endpoints require a JWT token in the header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Register User
**What it does:** Creates a new user account. Returns the new user info plus JWT tokens so they can start using the app immediately.
**How to use it:** Send username, email, password (twice for confirmation). No token needed.

**Endpoint:** `POST /users/register/`  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "token": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response (400):**
```json
{
  "username": ["A user with that username already exists."],
  "email": ["This field must be unique."],
  "password": ["Passwords don't match."]
}
```

---

### 2. Login
**What it does:** Signs in existing user with username/password. Returns user info and JWT tokens.
**How to use it:** Send username and password. No token needed. Use the returned access token for all future requests.

**Endpoint:** `POST /users/login/`  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. Get Current User Profile
**What it does:** Returns the logged-in user's profile information (username, email, bio, picture, etc.).
**How to use it:** Include your JWT access token in the Authorization header. Returns 401 if token is missing or invalid.

**Endpoint:** `GET /users/me/`  
**Auth Required:** Yes (JWT)

**Request Headers:**
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Software developer",
  "profile_picture": "https://example.com/photo.jpg",
  "date_joined": "2026-01-13T10:30:00Z"
}
```

**Error Response (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 4. Update User Profile
**What it does:** Updates the logged-in user's bio or profile picture. Only affects the authenticated user.
**How to use it:** Send your access token in the header, then include the fields you want to change (bio, picture). You can update one or both fields.

**Endpoint:** `PUT /users/me/`  
**Auth Required:** Yes (JWT)

**Request Body (partial updates allowed):**
```json
{
  "bio": "Updated bio text",
  "profile_picture": "https://example.com/new-photo.jpg"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Updated bio text",
  "profile_picture": "https://example.com/new-photo.jpg",
  "date_joined": "2026-01-13T10:30:00Z"
}
```

---

### 5. Refresh JWT Token
**What it does:** Gets a brand new access token without requiring the user to login again. Use this when your access token expires after 1 hour.
**How to use it:** Send your refresh token (no JWT header needed). You'll get a new access token valid for another 1 hour. Repeat this process for up to 7 days until refresh token expires.

**Endpoint:** `POST /users/refresh/`  
**Auth Required:** No (uses refresh token)

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Response (401):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

## Token Lifetimes

- **Access Token:** 1 hour
- **Refresh Token:** 7 days

**Usage Pattern:**
1. Login → Get both tokens
2. Use access token for all API calls
3. When access token expires (401 error) → Use refresh token to get new access token
4. When refresh token expires → User must login again

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created (registration successful) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (valid token, insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Integration Examples

### For Team B (Groups), C (Tasks), D (Meetings)

**Example: Creating a group (Team B)**

```python
import requests

# User logs in first
login_response = requests.post('http://localhost:8000/api/users/login/', json={
    'username': 'johndoe',
    'password': 'SecurePass123!'
})
token = login_response.json()['token']['access']

# Now create a group with the token
headers = {'Authorization': f'Bearer {token}'}
group_response = requests.post('http://localhost:8000/api/groups/', 
    headers=headers,
    json={'name': 'Study Group'}
)
```

---

### For Team E (Frontend)

**Example: Login flow in React**

```javascript
// Login
const response = await fetch('http://localhost:8000/api/users/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();
// Store tokens in localStorage
localStorage.setItem('access_token', data.token.access);
localStorage.setItem('refresh_token', data.token.refresh);

// Make authenticated requests
const profileResponse = await fetch('http://localhost:8000/api/users/me/', {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

## Testing Tools

**Postman Collection:** [Link TBD]  
**cURL Examples:** See above  
**Django Browsable API:** `http://localhost:8000/api/` (when server is running)

---

## Questions?

Contact Team A for auth-related questions or issues.

**Team A Contact:** [Your name/Discord/email]

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| Jan 13, 2026 | Initial draft | Team A |
