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
**Timeline:** Weeks 1-3 (backend auth setup), Weeks 4-5 (auth frontend using Connor's components), Weeks 6-7 (testing & polish), Weeks 8-11 (integration & deployment)

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

## Weeks 2–3: Core Authentication Backend (Jan 20–Feb 2)

### Prerequisites
- Week 1 setup complete

### Your Tasks
- [x] **User Model**
  - [x] Extend Django's `AbstractUser` (or use default User model)
  - [x] Add custom fields if needed: `profile_picture`, `bio`, etc.
  - [x] Write migrations

- [x] **Registration Endpoint**
  - [x] `POST /api/users/register/`
  - [x] Accept: `username`, `email`, `password`, `password_confirm`
  - [x] Return: User data + token
  - [x] Add validation (unique username/email, password strength)

- [x] **Login Endpoint**
  - [x] `POST /api/users/login/`
  - [x] Accept: `username/email`, `password`
  - [x] Return: JWT token + user data
  - [x] Use Django's `authenticate()` function

- [x] **JWT Token Setup**
  - [x] Configure JWT in `settings.py` (use `djangorestframework-simplejwt` or `djangorestframework-jwt`)
  - [x] Token expiration: 1 hour (access), 7 days (refresh)
  - [x] Write JWT authentication middleware

- [x] **User Profile Endpoint**
  - [x] `GET /api/users/me/` — Get current authenticated user profile
  - [x] `PUT /api/users/me/` — Update profile
  - [x] Require JWT authentication

- [x] **Permission Classes**
  - [x] Create `IsAuthenticated` decorator for protected endpoints
  - [x] Create `IsOwner` decorator for user-specific endpoints
  - [x] Add to all endpoints that require auth

- [x] **Token Refresh Endpoint**
  - [x] `POST /api/users/refresh/` — Refresh JWT token
  - [x] Accept: refresh token
  - [x] Return: new access token

- [x] **Logout Endpoint**
  - [x] `POST /api/users/logout/` — Logout user (optional, mainly for frontend)
  - [x] Clear/invalidate token if needed
  - [x] Return success message

- [x] **Backend Error Handling**
  - [x] Validate all input (username, email, password format)
  - [x] Handle duplicate username/email gracefully
  - [x] Return clear error messages (e.g., "Username already exists")
  - [x] Return proper HTTP status codes (400 for bad request, 401 for auth, 404 for not found)
  - [x] Log errors server-side for debugging

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
- [x] User model with migrations
- [x] Registration endpoint working (`POST /api/users/register/`)
- [x] Login endpoint working (`POST /api/users/login/`)
- [x] JWT tokens generated and validated

---

## Weeks 4–5: Auth Frontend Pages (Feb 3–16)

### Prerequisites
- Registration & login backend endpoints working
- Connor has built design system + shared components
- React project set up

### Your Tasks
- [X] **Build React Auth Pages**
  - [ ] Set up folder structure for auth pages: `/src/pages`, `/src/context`, `/src/components`, `/src/services`
  - [ ] Create `services/api.js` — Axios instance configured with base URL and interceptors for JWT tokens
  - [ ] Create `context/AuthContext.js` to manage authentication state globally
  - [ ] Create `pages/Login.js` — login form using Connor's Button/Input components
  - [ ] Create `pages/Register.js` — registration form
  - [ ] Create `pages/Profile.js` — user profile page with edit functionality
  - [ ] Create `components/PrivateRoute.js` — protect authenticated pages
  - [ ] Integrate all pages with backend API endpoints
  - [ ] Store/retrieve JWT tokens properly in localStorage
  - [ ] Attach token to all API requests

- [ ] **Connect React to Django Backend**
  - [ ] Verify Django CORS settings allow `http://localhost:3000` in `settings.py`
  - [ ] Ensure `CORS_ALLOW_CREDENTIALS = True` is set
  - [ ] Create API service layer (`services/api.js`) with axios interceptors
  - [ ] Configure base URL: `http://localhost:8000/api`
  - [ ] Add JWT token to Authorization header in all authenticated requests
  - [ ] Test connection: Start Django (`python manage.py runserver`) and React (`npm start`)
  - [ ] Verify registration/login API calls work from React UI

- [ ] **Handle JWT Token Management**
  - [ ] Store token in localStorage on login
  - [ ] Attach token to all API requests
  - [ ] Handle token expiration and refresh
  - [ ] Clear token on logout

- [ ] **Build Logout Functionality**
  - [ ] Add logout button to profile page
  - [ ] Call `AuthContext.logout()` on click
  - [ ] Clear localStorage
  - [ ] Redirect to login page

- [ ] **Frontend Error Handling**
  - [ ] Display form validation errors clearly
  - [ ] Show error messages from backend (e.g., "Username already exists")
  - [ ] Handle network errors (connection timeouts, server errors)
  - [ ] Display error notifications in UI (not just console logs)
  - [ ] Provide user-friendly error messages (avoid technical jargon)
  - [ ] Handle 401 (Unauthorized) errors — redirect to login
  - [ ] Handle 404 (Not Found) errors — show "not found" message
  - [ ] Handle 500 (Server Error) — show "something went wrong" message

- [ ] **Test All Auth Flows**
  - [ ] Test register → login → profile → logout flow
  - [ ] Test JWT token storage and retrieval
  - [ ] Test protected routes redirect correctly

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

## Weeks 6–7: Auth Testing, Polish & Integration (Feb 17–Mar 2)

### Prerequisites
- All auth backend endpoints working
- All auth frontend pages complete
- Team B, C, D have working endpoints

### Your Tasks
- [ ] **Auth Backend Testing**
  - [ ] Write unit tests for registration, login, profile endpoints
  - [ ] Test JWT token generation and validation
  - [ ] Test permission decorators
  - [ ] Test error handling (duplicate username, invalid password, missing fields)
  - [ ] Test 400/401/404 status codes returned correctly
  - [ ] Aim for 80%+ code coverage

- [ ] **Auth Frontend Testing**
  - [ ] Test complete auth flow (register → login → view profile → logout)
  - [ ] Test error handling and validation messages displayed
  - [ ] Test network error scenarios (connection timeout, server error)
  - [ ] Test error messages are user-friendly and helpful
  - [ ] Test on multiple browsers
  - [ ] Test responsive design on mobile

- [ ] **Polish Auth Pages**
  - [ ] Add loading states to auth pages
  - [ ] Add proper error notifications
  - [ ] Improve form validation messages
  - [ ] Ensure consistent styling with Connor's design system
  - [ ] Test accessibility

- [ ] **Integration Testing**
  - [ ] Verify Team B, C, D can authenticate successfully
  - [ ] Test token usage in downstream APIs
  - [ ] Help teammates debug auth issues

- [ ] **Documentation**
  - [ ] Write docstrings for all auth endpoints
  - [ ] Document API contract for others (request/response examples)
  - [ ] Create setup guide for other frontend devs
  - [ ] Document how to use AuthContext

### Deliverables by End of Week 7
- [ ] Auth backend fully tested with unit tests
- [ ] Login/Register/Profile pages fully functional and polished
- [ ] Auth context managing state properly
- [ ] Protected routes working correctly
- [ ] JWT token handling complete and secure
- [ ] Integration testing with Team B, C, D complete
- [ ] API documentation complete
- [ ] All bugs fixed and code reviewed

---

## Weeks 8–9: Integration & Team Support (Mar 3–16)

### Prerequisites
- Auth backend endpoints complete and tested
- Auth frontend pages complete and tested
- Team B, C, D have working endpoints

### Your Tasks
- [ ] **Help Other Teams Integrate**
  - [ ] Review Team B's (Groups) implementation
  - [ ] Review Team C's (Tasks) implementation  
  - [ ] Review Team D's (Meetings) implementation
  - [ ] Ensure all teams are using JWT correctly
  - [ ] Help debug auth-related issues

- [ ] **Full App Integration Testing**
  - [ ] Test complete user journey across all features
  - [ ] Test all team endpoints with your auth system
  - [ ] Verify data integrity across teams

- [ ] **Final Auth Polish**
  - [ ] Handle edge cases and error scenarios
  - [ ] Optimize performance
  - [ ] Final security review

### Deliverables by End of Week 9
- [ ] All auth features integrated with other team endpoints
- [ ] All auth pages polished and fully tested
- [ ] Other teams successfully using your auth system
- [ ] No auth-related bugs or issues
- [ ] Complete documentation for auth system

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
