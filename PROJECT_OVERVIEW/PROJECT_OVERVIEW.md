# GroupSync — Project Overview

## Project Summary

GroupSync is a web application for college students to manage group projects in one place. It solves common problems like unclear task ownership, missed meetings, and scattered links.

**Core idea:** "A simple hub for group projects: tasks, meetings, and resources — without chaos."

---

## Timeline & Deadline

- **Start Date:** January 13, 2026
- **Deadline:** April 1, 2026
- **Duration:** 11 weeks
- **Team Size:** 5 people

---

## Tech Stack

- **Backend:** Django + Django REST Framework + PostgreSQL
- **Frontend:** React (SPA)
- **Hosting:** Render (free tier)
- **Version Control:** GitHub
- **Chat:** Polling-based message board (3-second refresh)

---

## Implementation Plan: Coordinated Timeline

### **Week 1 (Jan 13–19): Setup & API Contracts**

**All Teams Together:**
- [ ] Django project initialization (Team A leads)
- [ ] Database schema finalization and ERD
- [ ] **API contract specification** (exact endpoint URLs, request/response schemas)
- [ ] GitHub repo, branches, Render account
- [ ] Git workflow agreement

**Output:** Shared API spec document (critical for parallel work)

---

### **Week 2 (Jan 20–26): Frontend Shell + Backend Foundations**

**🔴 Critical Week for Team E → Unblocks Everyone**

| Team | Tasks | Deliverable |
|------|-------|-------------|
| **A** | User model, registration endpoint, login endpoint | Basic auth working (can test with curl) |
| **B** | Group model, invite code generation | DB schema ready (no endpoints yet) |
| **C** | Task model schema | DB schema ready (no endpoints yet) |
| **D** | Meeting model schema | DB schema ready (no endpoints yet) |
| **🟢 E** | **App.js with Router, Nav component, Dashboard page placeholder, GroupWorkspace page placeholder** | **Frontend shell ready for Teams B, C, D** |

**Why This Order:** Teams B, C, D need the React Router set up to create their own pages in Week 3. They can't build pages if `App.js` doesn't exist yet.

---

### **Weeks 3–5 (Jan 27–Feb 16): Parallel Endpoints + Components**

**Team A:**
- [ ] User profile endpoints, token refresh
- [ ] Permission decorators
- [ ] React: Login/register/profile pages + Auth context

**Team B:**
- [ ] Group CRUD endpoints, join group endpoint
- [ ] GroupMember model and permissions
- [ ] React: Group list, create group, join group forms + members list

**Team C:**
- [ ] Task CRUD endpoints, status filtering
- [ ] Permission checks (only group members)
- [ ] React: Kanban board, task creation modal, task editing

**Team D:**
- [ ] Meeting CRUD endpoints, datetime filtering
- [ ] Permission checks
- [ ] React: Meeting list, create meeting modal, meeting details

**Team E:**
- [ ] Message model + endpoints with pagination
- [ ] React: Message board component (with mock data initially)
- [ ] Start shared component library (Button, Input, Card, Modal)

**Key:** All teams use **mock data** for React until Week 4, enabling parallel testing

---

### **Weeks 6–7 (Feb 17–Mar 2): Real API Integration + Polling**

**Team A:**
- [ ] Unit tests for auth (target 80%+ coverage)
- [ ] Verify integration with Teams B, C, D

**Team B:**
- [ ] Unit tests for groups
- [ ] Verify Group endpoints work with Team A's auth

**Team C:**
- [ ] Unit tests for tasks
- [ ] Connect React to real Task API (replace mock data)
- [ ] Test Kanban updates

**Team D:**
- [ ] Unit tests for meetings
- [ ] Connect React to real Meeting API (replace mock data)
- [ ] Test calendar/list filtering

**Team E:**
- [ ] Message board polling (3-second interval) working
- [ ] Connect to real Message API
- [ ] All shared components polished + documented
- [ ] Dashboard fetches real groups/tasks/meetings from APIs

**Output:** Fully functional app (all features talking to real backend)

---

### **Weeks 8–9 (Mar 3–16): Integration Testing & Polish**

**All Teams:**
- [ ] End-to-end testing (register → create group → add task → message)
- [ ] Verify all APIs work together
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

**Team E (Leads Polish):**
- [ ] Design system review across all components
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Consistent styling everywhere
- [ ] Loading/error states on all pages
- [ ] Help other teams integrate their components

**All Teams:**
- [ ] Bug fixes discovered in integration testing
- [ ] Performance testing and optimization

---

### **Weeks 10–11 (Mar 17–Apr 1): Final Testing & Deployment**

**All Teams:**
- [ ] Final unit/integration tests
- [ ] Code review of all features
- [ ] Documentation (README, setup guide)

**Team A (Deployment Lead):**
- [ ] Set up Render PostgreSQL database
- [ ] Deploy Django backend
- [ ] Configure environment variables
- [ ] Run migrations on production

**Team E:**
- [ ] Build production React build (`npm run build`)
- [ ] Deploy React frontend
- [ ] Test all endpoints on live site
- [ ] Configure CORS for production domain

**All Teams:**
- [ ] Live testing on Render
- [ ] Bug fixes on production issues
- [ ] Prepare team presentation/demo

**Output:** Live, fully functional app on Render

---

## API Contract Strategy (Prevents Blocking)

To enable parallel work, **Week 1 establishes exact API specs:**

Example: `GET /api/tasks/`
```json
Response: [
  {
    "id": 1,
    "title": "string",
    "status": "todo|doing|done",
    "due_date": "2026-04-01T00:00:00Z",
    "assigned_to": 1,
    "group_id": 1,
    "created_by": 1,
    "created_at": "2026-01-13T00:00:00Z"
  }
]
```

- **Team C** builds this endpoint week 3
- **Team E** builds UI with hardcoded mock data week 2 (matching this schema)
- Week 4: Drop-in replacement (real API works immediately)

---

## Database Schema (High-Level)

```
User
├── id (PK)
├── username
├── email
├── password
└── created_at

Group
├── id (PK)
├── name
├── owner_id (FK → User)
├── invite_code (unique)
└── created_at

GroupMember
├── id (PK)
├── group_id (FK → Group)
├── user_id (FK → User)
├── role (owner|member)
└── joined_at

Task
├── id (PK)
├── group_id (FK → Group)
├── title
├── status (todo|doing|done)
├── due_date (nullable)
├── assigned_to (FK → User)
├── created_by (FK → User)
└── created_at

Meeting
├── id (PK)
├── group_id (FK → Group)
├── title
├── start_time
├── location_or_link
├── agenda (nullable)
├── created_by (FK → User)
└── created_at

Resource
├── id (PK)
├── group_id (FK → Group)
├── title
├── url
├── created_by (FK → User)
└── created_at

Message
├── id (PK)
├── group_id (FK → Group)
├── author_id (FK → User)
├── text
└── created_at
```

---

## Hosting on Render

**Why Render:**
- Free tier includes Django web service (512 MB RAM)
- Free PostgreSQL database (256 MB, 7-day backups)
- Auto-deploys from GitHub on every push
- React frontend deployed as static site
- All 5 team members deploy at no extra cost

**Cost:** $0/month indefinitely (free tier)

**Deployment (Week 11):**
1. Create Render account
2. Connect GitHub repo
3. Create Django web service → auto-deploys on push
4. Create PostgreSQL database → Django auto-configures
5. Build React (`npm run build`) → deploy as static site
6. Push to main → Render deploys automatically

---

## Critical Dependencies & How to Avoid Blocking

### Dependency Chain
```
Team A (Auth)
  ↓
Team B (Groups) → Can start Week 2, depends on Team A's User model
  ↓
Team C (Tasks) → Can start Week 3, depends on Teams A + B
  ↓
Team D (Meetings) → Can start Week 3, depends on Teams A + B
  ↓
Team E (Frontend) → Can start Week 1, but CRITICAL: Must provide Router by end of Week 2
  ↓
Teams B, C, D (Frontend Components) → Can start Week 3 *only if* Team E's Router is ready
```

### How We Prevent Blocking

1. **API Contracts First (Week 1)**
   - Before any code, all teams agree on exact endpoint signatures
   - Teams B, C, D can build mock data matching this schema
   - When real endpoints arrive, it's a drop-in replacement

2. **Team E's React Shell (Week 2)**
   - Must complete by end of Week 2 so Teams B, C, D can create routes
   - Router, Nav component, empty page placeholders
   - Unblocks Teams B, C, D from starting their React work in Week 3

3. **Mock Data Strategy**
   - Teams don't wait for other teams' APIs
   - Each team builds UI with hardcoded mock data
   - Week 6-7: Swap mock data for real API calls

4. **Daily Pulls**
   - Everyone pulls `develop` branch every morning
   - Catches blocking issues early (broken migrations, API changes)

### If a Team Gets Blocked

| Scenario | Solution |
|----------|----------|
| Team B waiting for Team A's User model | Use hardcoded test User IDs in code/tests |
| Team C waiting for Team B's Group endpoints | Build Task UI with mock groups, mock endpoint URLs |
| Teams B, C, D waiting for Team E's Router | **Team E deploys minimal Router by end of Week 2** |
| Merge conflicts | Ensure each team owns separate files (Team A owns `users/`, etc.) |

---

## Workflow Rules (Updated)

1. **Branching:**
   - `main` branch (protected, prod-ready code)
   - `develop` branch (integration, weekly merges from features)
   - Feature branches: `feature/auth`, `feature/groups`, `feature/tasks`, `feature/meetings`, `feature/messaging` (one per team)
   - **PRs must be reviewed before merging to develop**

2. **File Ownership** (Prevents Conflicts):
   - **Team A owns:** `users/` app + `users/tests.py`
   - **Team B owns:** `groups/` app + `groups/tests.py`
   - **Team C owns:** `tasks/` app + `tasks/tests.py`
   - **Team D owns:** `meetings/` app + `meetings/tests.py`
   - **Team E owns:** `frontend/` (React project) + `messages/` app + `messages/tests.py`
   - **Shared:** `requirements.txt`, `settings.py` (database config only), `.gitignore`

3. **Daily Practice:**
   - **Every morning:** `git pull origin develop` (sync with team)
   - **Throughout day:** Push to feature branch as you work
   - **End of day:** All work committed and pushed
   - **Thursday:** Merge day (Team E = merge captain for Week 1-2, rotate after)
   - **Monday:** Sprint standup (sync status)

4. **Merge Ceremony (Every Thursday)**
   - [ ] All team members create PR from feature branch → develop
   - [ ] Merge captain reviews PRs
   - [ ] Run all tests locally before merge
   - [ ] After all PRs merged: `git pull origin develop` on everyone's machine
   - [ ] **Friday morning:** Everyone starts fresh with latest code

5. **Code Standards:**
   - **Python:** PEP 8 (max 100 chars per line)
   - **JavaScript:** Prettier formatting, ESLint for linting
   - **Both:** Use type hints / prop validation
   - **Tests:** Minimum 80% code coverage per team
   - **Migrations:** Each team's migrations must be in their own app folder

6. **Communication Channels:**
   - **Team-wide syncs:** Monday 10am (status), Thursday 3pm (pre-merge review)
   - **Async:** Slack/Discord for quick questions
   - **API issues:** #backend channel (alert all teams immediately)
   - **Frontend issues:** #frontend channel (alert Team E + whoever is affected)
   - **Blockers:** Announce in team meeting immediately (don't wait until Thursday)

---

## Team Assignments & Roles

| Team | Feature | Estimated Hours | Primary Role | Frontend Responsibility |
|------|---------|-----------------|--------------|------------------------|
| **A** | Users & Auth | 30–35 | **Foundation** - Build Django project, User model, JWT auth | Login/Register pages, User profile |
| **B** | Groups & Members | 30–35 | **Core Data** - Group CRUD, invite codes, membership | Group management UI, members list |
| **C** | Tasks | 30–35 | **Task Management** - Task CRUD, status tracking, assignments | Kanban board, task creation/editing |
| **D** | Meetings | 30–35 | **Scheduling** - Meeting CRUD, datetime handling, filtering | Meeting list, calendar view, create/edit |
| **E** | Messaging & UI | 30–35 | **Frontend Orchestration** - React app shell, design system, messaging | Router/Nav, Dashboard, message board, UI polish |

---

## Team Roles & Responsibilities (Detailed)

### **Team A: Foundation Layer**
- **Backend:** Django project init, User model, JWT auth, permissions
- **Frontend:** Login page, registration page, user profile page, Auth context
- **Key Deliverable:** All other teams depend on this
- **Critical Path:** Weeks 1–3 (must finish early)

### **Team B: Data Relationships**
- **Backend:** Group model, GroupMember model, invite code system, CRUD endpoints
- **Frontend:** Group list, create group, join group UI, members list view
- **Depends On:** Team A's User/Auth system
- **Key Integration:** Provides group_id for Teams C, D, E

### **Team C: Task Management**
- **Backend:** Task model with status/assignment fields, CRUD endpoints
- **Frontend:** Kanban board (To-Do/Doing/Done columns), task creation modal
- **Depends On:** Team A (auth), Team B (groups)
- **Key Integration:** Feeds task data to Team E's dashboard

### **Team D: Meeting Scheduling**
- **Backend:** Meeting model with datetime fields, CRUD endpoints, filtering
- **Frontend:** Meeting list view, calendar view (optional), create/edit modals
- **Depends On:** Team A (auth), Team B (groups)
- **Key Integration:** Feeds meeting data to Team E's dashboard

### **Team E: Frontend Orchestration**
- **Backend:** Message model, message endpoints, polling support
- **Frontend:** App router structure, navigation, dashboard, message board, all shared components
- **Depends On:** Teams A, B, C, D for API contracts
- **Critical Role:** Unblocks Teams B, C, D in Week 2 (provides React shell)

---

## Deliverables by Deadline (April 1)

- [ ] Live app on Render
- [ ] All CRUD features functional
- [ ] User authentication working
- [ ] Message board (polling) functional
- [ ] Responsive React UI
- [ ] ~~API documentation (Swagger)~~ **OPTIONAL** (use browsable API instead if behind)
- [ ] Unit tests for all apps
- [ ] GitHub repository with clean history
- [ ] Team presentation/demo
- [ ] README with setup instructions

---

## Success Metrics

- ✅ All 5 team members contribute
- ✅ No merge conflicts (via clear ownership)
- ✅ Feature parity across tasks/meetings/resources
- ✅ Live deployment by April 1
- ✅ <1 second page load time
- ✅ <5% downtime during semester
