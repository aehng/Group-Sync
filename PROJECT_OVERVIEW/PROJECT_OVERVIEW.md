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

## Implementation Plan: Parallel Development

### Week 1 (Jan 13–19): Planning & Design Sprint
All teams collaborate on:
- Django project skeleton initialization (Team A leads)
- ERD and database schema finalization
- API contract specifications (request/response schemas)
- Git repo setup, GitHub, Render account, CI/CD configuration

**Output:** Shared API specification document that all teams use as contract

### Weeks 2–7 (Jan 20–Mar 2): Parallel Development with Mocks
Teams work simultaneously using mock dependencies:

**Team A (Users/Auth):** ~30–35 hours
- Django authentication system
- JWT token implementation
- User profiles and registration
- Permission decorators and auth middleware

**Team B (Groups & Members):** ~25–30 hours
- Group creation and deletion
- Invite code generation and validation
- GroupMember relationships
- Owner/Member role enforcement
- Use mock auth if needed

**Team C (Tasks):** ~25–30 hours
- Task CRUD endpoints
- Status updates (To-Do / Doing / Done)
- Due date handling
- Assignment logic
- Use mock Groups/Users if needed

**Team D (Meetings):** ~25–30 hours
- Meeting CRUD endpoints
- DateTime handling and validation
- Location and Zoom link fields
- Meeting listing and filtering
- Use mock Groups/Users if needed

**Team E (Frontend & Messaging):** ~35–40 hours
- React project setup
- Dashboard layout and navigation
- Group workspace UI (tabs, sidebar, etc.)
- Task, meeting, members, resources pages
- Forms for creating/editing items
- Initial integration with mock API responses
- Start Message board UI with polling

### Weeks 3–7: Continuous Integration
- Teams push working endpoints to main as soon as ready
- Team E incrementally swaps mock endpoints for real ones
- Daily pulls ensure everyone sees latest changes
- Mock database with fixtures allows integration testing from day 1

### Weeks 8–9 (Mar 3–16): Integration & Messaging
- All core APIs fully implemented and integrated
- Team E: Final UI polish and responsive design
- Message model implementation
- Polling-based message board (3-second refresh)
- Add drf-spectacular Swagger API docs (all teams)
- Team-wide integration testing

### Weeks 10–11 (Mar 17–Apr 1): Testing, Deployment & Polish
- Unit tests for all apps (each team owns their tests)
- Deploy to Render with PostgreSQL
- Load testing and bug fixes
- Final UI polish
- Documentation and README
- Team presentation preparation

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

## Workflow Rules

1. **Branching:**
   - `main` branch (protected, prod-ready code)
   - `develop` branch (integration, weekly merges from features)
   - Feature branches: `feature/auth`, `feature/tasks`, etc. (one per team)

2. **Daily Practice:**
   - Pull from `main` every morning
   - Push to feature branch by EOD
   - Merge captain (rotate weekly) merges PRs on Thursday

3. **Conflict Prevention:**
   - Each team owns separate Django apps (minimal file overlap)
   - Migrations only for your own app
   - API contracts defined week 1 → no surprise changes

4. **Communication:**
   - Monday standup (sync)
   - Slack/Discord for async questions
   - Thursday merge day (all PRs go to develop)
   - Weekly sprints (checkpoint Monday, deliver Thursday)

---

## Team Assignments

| Team | Lead | Feature | Hours |
|------|------|---------|-------|
| **A** | You | Project Setup, Auth, Users | 30–35 |
| **B** | — | Groups, Members, Invites | 25–30 |
| **C** | — | Tasks, Status, Assignments | 25–30 |
| **D** | — | Meetings, DateTime, Scheduling | 25–30 |
| **E** | — | Frontend (React), Messaging, UI | 35–40 |

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
