# Team A: Users & Authentication Workflow

## Time Log

| Date       | Hours Worked | Description of Work                  |
|------------|--------------|--------------------------------------|
| 2026-01-12 | 1            | Project setup                        |
| 2026-01-13 | 1.5          | Project setup and roles documents    |

---

# Team A: Users & Authentication Workflow

**Feature:** User registration, login, profiles, JWT authentication, permission system (Backend + Frontend)  
**Estimated Hours:** 30–35  
**Team Size:** 1 person (You)  
**Timeline:** Weeks 1–7 (backend + frontend), Weeks 8–11 (integration & refinement)

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- None (you're the foundation team)

### Your Tasks
- [x] **Initialize Django project**
  - [x] Create virtual environment
  - [x] Install Django, DRF, psycopg2 (PostgreSQL driver), PyJWT
  - [x] Create Django project `groupsync/`
  - [x] Create `users` app within project

- [x] **Database setup**
  - [x] Set up PostgreSQL locally (or use SQLite for dev, migrate to PostgreSQL week 11)
  - [x] Configure Django `settings.py` with database connection (needs REST framework + users app config)
  - [x] Create initial migrations

- [x] **Git & GitHub setup**
  - [x] Initialize git repo locally
  - [x] Create GitHub repo for the team
  - [x] Create branches: `main` (protected), `develop`, `feature/auth`
  - [x] Add requirements.txt (created)
  - [x] Add .gitignore, README.md

- [x] **API Contract Definition**
  - [x] Document expected auth endpoints with Team B, C, D, E
  - [x] Define request/response schemas (see examples below)
  - [x] Post in shared document or GitHub wiki

- [x] **Render Setup**
  - [x] Create Render account
  - [x] Connect GitHub repo
  - [x] (Don't deploy yet; wait until week 11)

### Deliverables by End of Week 1
- [x] Django project initialized and running locally
- [x] SQLite configured in `settings.py`
- [x] `users` app created with initial migrations
- [x] GitHub repo set up with protected main branch
- [x] API contract document shared with team
- [x] Render account connected to GitHub

---

## Weeks 2–3: Core Authentication (Jan 20–Feb 2)

### Prerequisites
- Week 1 setup complete

### Your Tasks
- [ ] **User Model**
  - [ ] Extend Django's `AbstractUser` (or use default User model)
  - [ ] Add custom fields if needed: `profile_picture`, `bio`, etc.
  - [ ] Write migrations

- [ ] **Registration Endpoint**
  - [ ] `POST /api/users/register/`
  - [ ] Accept: `username`, `email`, `password`, `password_confirm`
  - [ ] Return: User data + token
  - [ ] Add validation (unique username/email, password strength)

- [ ] **Login Endpoint**
  - [ ] `POST /api/users/login/`
  - [ ] Accept: `username/email`, `password`
  - [ ] Return: JWT token + user data
  - [ ] Use Django's `authenticate()` function

- [ ] **JWT Token Setup**
  - [ ] Configure JWT in `settings.py` (use `djangorestframework-simplejwt` or `djangorestframework-jwt`)
  - [ ] Token expiration: 1 hour (access), 7 days (refresh)
  - [ ] Write JWT authentication middleware

### Code Example

```python
# users/models.py
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    bio = models.TextField(blank=True)
    profile_picture = models.URLField(blank=True)
    
    def __str__(self):
        return self.username
```

```python
# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return {'user': user}
```

### Deliverables by End of Week 3
- [ ] User model with migrations
- [ ] Registration endpoint working (`POST /api/users/register/`)
- [ ] Login endpoint working (`POST /api/users/login/`)
- [ ] JWT tokens generated and validated
- [ ] All endpoints tested with Postman/curl

---

## Weeks 4–5: User Profiles & Permissions (Feb 3–16)

### Prerequisites
- Registration & login working

### Your Tasks
- [ ] **User Profile Endpoint**
  - [ ] `GET /api/users/me/` — Get current authenticated user profile
  - [ ] `PUT /api/users/me/` — Update profile
  - [ ] `DELETE /api/users/me/` — Delete account (careful!)
  - [ ] Require JWT authentication

- [ ] **Permission Classes**
  - [ ] Create `IsAuthenticated` decorator for protected endpoints
  - [ ] Create `IsOwner` decorator for user-specific endpoints
  - [ ] Add to all endpoints that require auth

- [ ] **Token Refresh Endpoint**
  - [ ] `POST /api/users/refresh/` — Refresh JWT token
  - [ ] Accept: refresh token
  - [ ] Return: new access token

- [ ] **Password Reset (Optional, Nice-to-Have)**
  - [ ] `POST /api/users/password-reset/` — Request reset link
  - [ ] `POST /api/users/password-reset-confirm/` — Reset with token
  - [ ] (Can defer to week 9 if time is tight)

### Code Example

```python
# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
```

### Deliverables by End of Week 5
- [ ] User profile endpoint (`GET /api/users/me/`)
- [ ] Profile update endpoint (`PUT /api/users/me/`)
- [ ] Token refresh endpoint (`POST /api/users/refresh/`)
- [ ] Permission decorators implemented
- [ ] All endpoints protected with JWT auth

---

## Weeks 6–7: Testing & Integration (Feb 17–Mar 2)

### Prerequisites
- All auth endpoints working
- Team B, C, D building with mock auth

### Your Tasks
- [ ] **Unit Tests**
  - [ ] Write tests for registration, login, profile endpoints
  - [ ] Test JWT token generation and validation
  - [ ] Test permission decorators
  - [ ] Aim for 80%+ code coverage

- [ ] **Integration Testing**
  - [ ] Verify Team B, C, D can authenticate successfully
  - [ ] Test token usage in downstream APIs
  - [ ] Help teammates debug auth issues

- [ ] **Documentation**
  - [ ] Write docstrings for all auth endpoints
  - [ ] Document API contract for others (request/response examples)
  - [ ] Prepare for drf-spectacular integration

- [ ] **Bug Fixes & Polish**
  - [ ] Fix any auth issues found during integration
  - [ ] Add email verification (optional, nice-to-have)
  - [ ] Ensure error messages are clear

### Test Example

```python
# users/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from .models import User

class RegisterTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_register_success(self):
        response = self.client.post('/api/users/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)
    
    def test_login_success(self):
        User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post('/api/users/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
```

### Deliverables by End of Week 7
- [ ] Unit tests written and passing
- [ ] Integration testing with Team B, C, D complete
- [ ] API documentation ready
- [ ] All bugs fixed

---

## Weeks 8–9: React Frontend Development (Mar 3–16)

### Prerequisites
- Backend auth endpoints complete and tested
- React project set up (coordinate with Team E for shared components)

### Your Tasks
- [ ] **Login Page**
  - [ ] Create `Login.js` component with username/email and password fields
  - [ ] Handle form submission with `axios.post('/api/users/login/')`
  - [ ] Store JWT token in localStorage
  - [ ] Redirect to dashboard on successful login
  - [ ] Display error messages for invalid credentials

- [ ] **Registration Page**
  - [ ] Create `Register.js` component with username, email, password, password_confirm fields
  - [ ] Handle form submission with `axios.post('/api/users/register/')`
  - [ ] Store JWT token in localStorage
  - [ ] Redirect to dashboard on successful registration
  - [ ] Display validation errors

- [ ] **User Profile Page**
  - [ ] Create `Profile.js` component to display user info
  - [ ] Fetch user data with `axios.get('/api/users/me/')` with JWT token in header
  - [ ] Allow editing profile (username, email, bio, profile picture)
  - [ ] Handle profile update with `axios.put('/api/users/me/')`
  - [ ] Add logout button (clear localStorage and redirect to login)

- [ ] **Auth Context/Provider**
  - [ ] Create `AuthContext.js` to manage authentication state globally
  - [ ] Provide `login()`, `logout()`, `register()` functions
  - [ ] Provide `isAuthenticated`, `currentUser` state
  - [ ] Wrap app in AuthProvider

- [ ] **Protected Routes**
  - [ ] Create `PrivateRoute.js` component to protect authenticated pages
  - [ ] Redirect to login if not authenticated

### Code Example

```javascript
// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
```

### Deliverables by End of Week 9
- [ ] Login page complete and functional
- [ ] Registration page complete and functional
- [ ] User profile page complete with edit functionality
- [ ] Auth context implemented
- [ ] Protected routes working
- [ ] JWT tokens stored and used correctly

---

## Weeks 10–11: Deployment & Final Polish (Mar 17–Apr 1)

### Prerequisites
- All features tested and documented

### Your Tasks
- [ ] **Deployment Preparation**
  - [ ] Update `requirements.txt` with all dependencies
  - [ ] Set environment variables (Django SECRET_KEY, PostgreSQL URL, etc.)
  - [ ] Test locally with production settings

- [ ] **Deploy to Render**
  - [ ] Push code to `main` branch
  - [ ] Render auto-deploys
  - [ ] Configure environment variables in Render dashboard
  - [ ] Run migrations on production database

- [ ] **Post-Deployment Testing**
  - [ ] Test registration/login on live app
  - [ ] Verify JWT tokens work in production
  - [ ] Check error handling

- [ ] **Final Documentation**
  - [ ] Write setup guide for team (in README)
  - [ ] Document any environment variables needed
  - [ ] Prepare for final presentation

### Deliverables by April 1
- [ ] Auth fully deployed on Render
- [ ] Production database configured
- [ ] All endpoints tested and working live
- [ ] Documentation complete
- [ ] README updated with setup instructions

---

## API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/users/register/` | POST | No | Create new user |
| `/api/users/login/` | POST | No | Get JWT token |
| `/api/users/me/` | GET | Yes | Get current user |
| `/api/users/me/` | PUT | Yes | Update profile |
| `/api/users/refresh/` | POST | No | Refresh JWT token |

---

## Dependencies

Add to `requirements.txt`:
```
Django==4.2
djangorestframework==3.14
djangorestframework-simplejwt==5.2
psycopg2-binary==2.9
drf-spectacular==0.26
```

---

## Blockers & How to Unblock

| Blocker | Solution |
|---------|----------|
| Not sure about Django | Refer to Django docs or ask team |
| PostgreSQL not working locally | Use SQLite for now, switch to PostgreSQL week 10 |
| Team members can't authenticate | Check JWT secret key in settings.py is shared |
| Render deployment failing | Check environment variables are set correctly |

---

## Notes for Team Members

- **This is the foundation.** Everything depends on your auth working perfectly.
- **Test thoroughly.** Bugs here cascade to all other teams.
- **Document everything.** Future teams need to understand how to use your auth.
- **Ask for help early.** If you're stuck, reach out to the team—no shame in collaboration!
