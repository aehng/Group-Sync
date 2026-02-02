# API Contract Review - Team E (Messaging & Frontend)

**Date Reviewed:** January 23, 2026  
**Reviewer:** Connor (Team E)  
**Status:** Review Complete ✓

---

## Overview

This document summarizes the API contracts from all teams and how they interact with Team E's messaging and frontend responsibilities.

---

## Team A: Authentication (User Management)

**Owner:** Eli  
**Key Endpoints for Team E:**

### Login & Token Management
- `POST /users/register/` - User registration (no auth required)
- `POST /users/login/` - Login with username/password (no auth required)
- `GET /users/me/` - Get current user profile (auth required)
- `PUT /users/me/` - Update profile (bio, picture) (auth required)
- `POST /users/refresh/` - Refresh JWT access token (no auth required)

### Key Details for Frontend Integration:
- **JWT Authentication:** All protected endpoints require `Authorization: Bearer <access_token>` header
- **Token Lifetimes:**
  - Access Token: 1 hour
  - Refresh Token: 7 days
- **Response Format:**
  ```json
  {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "bio": "Software developer",
      "profile_picture": "https://example.com/photo.jpg"
    },
    "token": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
  ```
- **Base URL:** `http://localhost:8000/api`

**Frontend Implementation Notes:**
- Store tokens in localStorage
- Refresh token before expiry or on 401 response
- Include bearer token in all authenticated API calls

---

## Team B: Groups & Members

**Owner:** Emiliano  
**Models:**
- **Group:** `id`, `name`, `owner` (FK User), `invite_code`, `created_at`, `updated_at`
- **GroupMember:** `id`, `group` (FK), `user` (FK), `role` (owner|member), `joined_at`

### Expected Endpoints (in development):
- `GET /api/groups/` - List user's groups
- `POST /api/groups/` - Create new group
- `GET /api/groups/{id}/` - Get group details
- `PUT /api/groups/{id}/` - Update group
- `POST /api/groups/{id}/members/` - Join group via invite code
- `GET /api/groups/{id}/members/` - List group members

### Invite System:
- Groups have unique 8-character alphanumeric invite codes
- Users join groups using invite codes
- Owner role auto-assigned to group creator
- Members have "member" role by default

**For Team E (Messaging):**
- Messages belong to a Group
- Need to fetch group details to display group name in messages UI
- Need group membership info to determine if user can view/post messages
- Messages endpoint will be: `GET /api/groups/{group_id}/messages/`

---

## Team C: Tasks

**Owner:** Fabrice  
**Model:**
- **Task:** `id`, `group` (FK), `title`, `description`, `status` (todo|doing|done), `due_date`, `assigned_to` (FK User, nullable), `created_by` (FK User), `created_at`, `updated_at`

### Expected Endpoints (in development):
- `GET /api/groups/{group_id}/tasks/` - List tasks in group (with optional filters)
- `GET /api/groups/{group_id}/tasks/{task_id}/` - Get single task
- `POST /api/groups/{group_id}/tasks/` - Create task
- `PUT /api/groups/{group_id}/tasks/{task_id}/` - Update task
- `DELETE /api/groups/{group_id}/tasks/{task_id}/` - Delete task

**For Team E (Messaging):**
- No direct interaction with tasks in messaging
- But task-related UI may appear on the dashboard
- Tasks are group-scoped, similar to messages

---

## Team D: Meetings

**Owner:** Ariana  
**Model:**
- **Meeting:** `id`, `group` (FK), `title`, `description`, `start_time`, `end_time` (optional), `location_or_link`, `agenda` (optional), `created_by` (FK User), `created_at`, `updated_at`

### Expected Endpoints (in development):
- `GET /api/groups/{group_id}/meetings/` - List meetings in group (with optional filters)
- `GET /api/groups/{group_id}/meetings/{meeting_id}/` - Get single meeting
- `POST /api/groups/{group_id}/meetings/` - Create meeting
- `PUT /api/groups/{group_id}/meetings/{meeting_id}/` - Update meeting
- `DELETE /api/groups/{group_id}/meetings/{meeting_id}/` - Delete meeting

**For Team E (Messaging):**
- No direct interaction with meetings in messaging
- May display upcoming meetings on group dashboard
- Meetings are group-scoped, similar to messages

---

## Team E: Messaging & Frontend

**Owner:** Connor  
**Primary Responsibility:** 

1. **Backend (Weeks 2-3):**
   - Create Message model: `id`, `group` (FK), `sender` (FK User), `content`, `created_at`
   - Build message endpoints for CRUD + polling

2. **Frontend (Weeks 4-5+):**
   - Build UI for all features from Teams A-D
   - Implement authentication flow
   - Build message board with real-time polling
   - Create dashboard showing groups, tasks, meetings

### Message Endpoints to Create:
```
GET /api/groups/{group_id}/messages/
  - List messages for a group (ordered by created_at)
  - Pagination: last 50 messages
  - Auth required

POST /api/groups/{group_id}/messages/
  - Create new message
  - Auto-set sender to authenticated user
  - Auth required

GET /api/groups/{group_id}/messages/{message_id}/
  - Get single message details
  - Auth required
```

---

## Frontend Architecture Summary

### Pages to Build:
1. **Login/Register Page** (uses Team A auth endpoints)
2. **Dashboard** (shows user's groups, upcoming tasks, upcoming meetings)
3. **Group Messages Page** (main messaging board)
4. **Group Settings** (manage group membership)
5. **Task Board** (show group tasks)
6. **Meetings Calendar** (show group meetings)

### Key Components Needed:
- **Authentication:**
  - Login form with username/password
  - Store/refresh JWT tokens
  - Logout functionality

- **Messaging:**
  - Message list with auto-refresh (poll every 3 seconds)
  - Message composer/input
  - Display sender name and timestamp
  - Real-time feel (optimistic UI updates)

- **Navigation:**
  - Header with user profile dropdown
  - Sidebar with list of user's groups
  - Breadcrumbs showing current group

- **Shared UI Components:**
  - Button, Input, Card, Modal
  - User avatar/profile picture
  - Loading spinners
  - Error notifications

---

## API Integration Checklist for Team E

### Phase 1: Authentication (Week 1)
- [ ] Review Team A's login/register endpoints
- [ ] Plan React login flow (store tokens in localStorage)
- [ ] Plan token refresh strategy (before expiry or on 401)
- [ ] Understand error responses from auth endpoints

### Phase 2: Messaging Backend (Weeks 2-3)
- [ ] Build Message model with group FK
- [ ] Create message serializer (include sender username)
- [ ] Implement GET messages endpoint (with pagination)
- [ ] Implement POST message endpoint (auto-set sender)
- [ ] Test endpoints with Postman or cURL

### Phase 3: Frontend Integration (Weeks 4-5+)
- [ ] Build login page using Team A endpoints
- [ ] Build group selection sidebar (fetch from Team B endpoints)
- [ ] Build message list component (fetch from messaging endpoints)
- [ ] Implement message polling (3-second interval)
- [ ] Build message composer and POST new messages
- [ ] Display tasks from Team C endpoints
- [ ] Display meetings from Team D endpoints

---

## API Contract Questions & Clarifications

### For Team A (Eli):
- [ ] Can users update their username/email or only bio/picture?
- [ ] What happens to user's groups/messages when account is deleted?

### For Team B (Emiliano):
- [ ] What's the exact response format for group list endpoint?
- [ ] Can non-owners invite others or only owner?
- [ ] When joining via invite code, how is the GroupMember role assigned?

### For Team C (Fabrice):
- [ ] What's the exact response format for task list endpoint?
- [ ] Can unassigned tasks be created (assigned_to = null)?

### For Team D (Ariana):
- [ ] What's the exact response format for meeting list endpoint?
- [ ] Should meetings show as upcoming vs. past based on start_time?

---

## Environment & Testing

**Development Base URL:** `http://localhost:8000/api`  
**Default Django Superuser:** (set up in Team A)  
**Testing Tools:**
- Postman (for manual API testing)
- Django Browsable API: `http://localhost:8000/api/`
- cURL (for command-line testing)

---

## Next Steps

1. ✓ Review API contracts from all teams (THIS DOCUMENT)
2. Build messaging backend (Weeks 2-3)
3. Build frontend login (Week 4)
4. Build group selection & navigation (Week 4)
5. Build message board UI (Week 5)
6. Integrate task & meeting views (Weeks 6-7)
7. Polish & optimization (Weeks 8-11)

---

## Notes

- All endpoints use JSON request/response format
- All protected endpoints require JWT in Authorization header
- Error responses follow consistent format (status code + error message)
- Group-scoped endpoints require user to be a member of that group
- Messages will need real-time feel via client-side polling (3-second refresh)

