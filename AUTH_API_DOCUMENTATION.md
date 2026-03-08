# Authentication API Documentation

## Overview

The GroupSync authentication system provides JWT-based authentication for all API endpoints. This document describes all authentication endpoints, their request/response formats, and usage examples.

**Base URL:** `http://localhost:8000/api/users/` (development)  
**Production URL:** `https://your-app.render.com/api/users/` (to be determined)

---

## Table of Contents

1. [User Registration](#user-registration)
2. [User Login](#user-login)
3. [Get User Profile](#get-user-profile)
4. [Update User Profile](#update-user-profile)
5. [Refresh Token](#refresh-token)
6. [Logout](#logout)
7. [Authentication Headers](#authentication-headers)
8. [Error Responses](#error-responses)

---

## User Registration

Create a new user account.

**Endpoint:** `POST /api/users/register/`  
**Authentication:** Not required

### Request Body

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Unique username (3-150 characters) |
| `email` | string | Yes | Unique email address (valid format) |
| `password` | string | Yes | Password (min 8 characters) |
| `password_confirm` | string | Yes | Must match password |

### Success Response (201 Created)

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "bio": "",
    "profile_picture": ""
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Error Responses

**400 Bad Request** - Validation errors:

```json
{
  "username": ["Username already exists"],
  "email": ["Email already exists"],
  "password": ["This password is too common"],
  "password_confirm": ["Passwords do not match"]
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!"
  }'
```

---

## User Login

Authenticate an existing user and receive JWT tokens.

**Endpoint:** `POST /api/users/login/`  
**Authentication:** Not required

### Request Body

```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Username or email |
| `password` | string | Yes | User's password |

### Success Response (200 OK)

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "bio": "Software developer",
    "profile_picture": "https://example.com/avatar.jpg"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Token Information

- **Access Token**: Valid for 60 minutes (use for API requests)
- **Refresh Token**: Valid for 7 days (use to get new access tokens)

### Error Responses

**401 Unauthorized** - Invalid credentials:

```json
{
  "non_field_errors": ["Unable to log in with provided credentials."]
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123!"
  }'
```

---

## Get User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /api/users/me/`  
**Authentication:** Required (JWT Token)

### Request Headers

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Success Response (200 OK)

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Software developer",
  "profile_picture": "https://example.com/avatar.jpg"
}
```

### Error Responses

**401 Unauthorized** - Invalid or missing token:

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

### Example cURL Request

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Update User Profile

Update the authenticated user's profile information. Partial updates are supported (only include fields you want to change).

**Endpoint:** `PUT /api/users/me/`  
**Authentication:** Required (JWT Token)

### Request Headers

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

### Request Body (all fields optional)

```json
{
  "bio": "Updated bio text",
  "profile_picture": "https://example.com/new-avatar.jpg"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | No | New username (must be unique) |
| `email` | string | No | New email (must be unique) |
| `bio` | string | No | User biography/description |
| `profile_picture` | string | No | URL to profile picture |

**Note:** Password cannot be updated through this endpoint (future feature).

### Success Response (200 OK)

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Updated bio text",
  "profile_picture": "https://example.com/new-avatar.jpg"
}
```

### Error Responses

**400 Bad Request** - Validation error:

```json
{
  "username": ["Username already exists"],
  "email": ["Enter a valid email address"]
}
```

**401 Unauthorized** - Invalid or missing token (see [Get User Profile](#get-user-profile) for example)

### Example cURL Request

```bash
curl -X PUT http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio text",
    "profile_picture": "https://example.com/new-avatar.jpg"
  }'
```

---

## Refresh Token

Get a new access token using a valid refresh token. Use this when your access token expires (after 60 minutes).

**Endpoint:** `POST /api/users/token/refresh/`  
**Authentication:** Not required (uses refresh token)

### Request Body

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | string | Yes | The refresh token received during login |

### Success Response (200 OK)

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Error Responses

**401 Unauthorized** - Invalid or expired refresh token:

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Logout

Invalidate the user's refresh token by adding it to the blacklist. The client should also clear all stored tokens.

**Endpoint:** `POST /api/users/logout/`  
**Authentication:** Required (JWT Token)

### Request Headers

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

### Request Body

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh` | string | Yes | The refresh token to blacklist |

### Success Response (205 Reset Content)

No response body. Status code 205 indicates successful logout.

### Error Responses

**400 Bad Request** - Missing refresh token:

```json
{
  "error": "Refresh token is required."
}
```

**400 Bad Request** - Failed to blacklist token:

```json
{
  "error": "Failed to logout."
}
```

**401 Unauthorized** - Invalid or missing access token (see [Get User Profile](#get-user-profile) for example)

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/users/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Authentication Headers

All authenticated endpoints require the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Example with Axios (JavaScript)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000'
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Make authenticated request
const response = await api.get('/api/users/me/');
```

---

## Error Responses

All error responses follow a consistent format:

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 205 | Reset Content | Logout successful, client should reset state |
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Invalid credentials or token |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

**Field-specific errors (validation):**

```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Error message for another field"]
}
```

**General errors:**

```json
{
  "detail": "Error message",
  "code": "error_code"
}
```

**Non-field errors:**

```json
{
  "non_field_errors": ["Error message"]
}
```

---

## Integration with Other Teams

### For Team B (Groups)

To protect group endpoints:

```python
from rest_framework.permissions import IsAuthenticated

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Automatically set owner to current user
        serializer.save(owner=self.request.user)
```

### For Team C (Tasks)

Access current user in views:

```python
class TaskView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # request.user is the authenticated User object
        tasks = Task.objects.filter(assigned_to=request.user)
        return Response(TaskSerializer(tasks, many=True).data)
```

### For Team D (Meetings)

Same pattern for meetings:

```python
class MeetingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Creator is automatically set to current user
        meeting = Meeting.objects.create(
            creator=request.user,
            title=request.data['title']
        )
        return Response(MeetingSerializer(meeting).data)
```

---

## Testing

### Using Postman

1. **Register a user**: POST to `/api/users/register/` with user data
2. **Copy the access token** from the response
3. **Set up authentication**: In Postman, go to Authorization tab → Type: Bearer Token → Paste access token
4. **Make authenticated requests**: All requests with this auth will include the token

### Using Python Requests

```python
import requests

# Register
response = requests.post(
    'http://localhost:8000/api/users/register/',
    json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'TestPass123!',
        'password_confirm': 'TestPass123!'
    }
)
tokens = response.json()
access_token = tokens['access']

# Make authenticated request
headers = {'Authorization': f'Bearer {access_token}'}
profile = requests.get(
    'http://localhost:8000/api/users/me/',
    headers=headers
)
print(profile.json())
```

---

## Notes

- Access tokens expire after **60 minutes**. Use the refresh endpoint to get a new one.
- Refresh tokens expire after **7 days**. Users must log in again after this period.
- Store tokens securely on the client (localStorage for web, secure storage for mobile).
- Always use HTTPS in production to protect tokens in transit.
- The logout endpoint blacklists refresh tokens to prevent reuse.

---

## Support

For questions or issues with authentication:

- **Backend issues**: Contact Eli (Team A)
- **Frontend integration**: See [AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)
- **API contract questions**: Check this document or ask in team Slack channel
