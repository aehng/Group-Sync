# GroupSync

A web application designed to help college students manage group projects in one place — tasks, meetings, and messaging without the chaos.

## Team Members

| Name | Role |
|------|------|
| Eli | Team A — Users & Authentication (Backend + Frontend) |
| Emiliano | Team B — Groups & Members (Backend + Frontend) |
| Fabrice | Team C — Tasks (Backend + Frontend) |
| Ariana | Team D — Meetings (Backend + Frontend) |
| Connor | Team E — Messaging & Frontend Architecture |

## Software Description

GroupSync is a full-stack web application built for college students working on group projects. It solves common collaboration problems: unclear task ownership, missed meetings, and communication scattered across multiple platforms.

Users can register an account, create or join groups using invite codes, assign and track tasks through a Kanban-style board, schedule meetings with location or Zoom link support, and communicate with group members through a real-time message board. All features are scoped to group membership so only authorized users can see and edit group content.

## Architecture

**Backend:** Django 4.2 + Django REST Framework, serving a RESTful JSON API. Authentication uses JSON Web Tokens (JWT) via `djangorestframework-simplejwt`. The database is SQLite for local development and PostgreSQL on production (Render).

**Frontend:** React single-page application (SPA) with `react-router-dom` for client-side routing and `axios` for API communication. The frontend is served as a static build from a Node.js Express server in production.

**Hosting:** Both the Django backend and the React frontend are deployed to [Render](https://render.com) as separate web services, configured via `render.yaml`.

**Version Control:** Git with GitHub. Each team member worked on a dedicated feature branch (`feature/auth`, `feature/groups`, `feature/tasks`, `feature/meetings`, `feature/messaging`) and merged into `develop` via pull requests.

```
main (production)
  ↑
develop (integration)
  ├── feature/auth       (Eli)
  ├── feature/groups     (Emiliano)
  ├── feature/tasks      (Fabrice)
  ├── feature/meetings   (Ariana)
  └── feature/messaging  (Connor)
```

## Software Features

### Backend API

- [x] User registration with validation (`POST /api/users/register/`)
- [x] User login returning JWT access and refresh tokens (`POST /api/users/login/`)
- [x] JWT token refresh (`POST /api/users/token/refresh/`)
- [x] User logout with token blacklisting (`POST /api/users/logout/`)
- [x] User profile view and update (`GET /PUT /api/users/me/`)
- [x] Group creation with auto-generated invite codes (`POST /api/groups/`)
- [x] List groups the authenticated user belongs to (`GET /api/groups/`)
- [x] Group detail, rename, and delete (`GET /PUT /DELETE /api/groups/<id>/`)
- [x] Join a group by invite code (`POST /api/groups/join/`)
- [x] Group member roles (owner vs. member) with role-based permissions
- [x] Task CRUD within groups (`/api/groups/<id>/tasks/`)
- [x] Task status tracking: `todo` → `doing` → `done`
- [x] Task assignment to group members
- [x] Task filtering by status, ordering by due date and priority
- [x] Meeting CRUD within groups (`/api/groups/<id>/meetings/`)
- [x] Meeting location / Zoom link field
- [x] Meeting filtering by upcoming or past date
- [x] Group messaging with cursor-based pagination (`/api/groups/<id>/messages/`)

### Frontend (React)

- [x] React SPA with client-side routing (`react-router-dom`)
- [x] User registration and login pages
- [x] Protected routes (redirect to login if not authenticated)
- [x] Navigation bar with active-link highlighting
- [x] Dashboard showing the user's groups, tasks, and meetings at a glance
- [x] Group list, create group, and join group pages
- [x] Group workspace hub page
- [x] Group detail page with member list
- [x] Task board (Kanban-style columns by status)
- [x] Task creation and task detail/edit pages
- [x] Meeting list, create meeting, and meeting detail pages
- [x] Calendar view aggregating meetings across all groups
- [x] Group message board with polling (per-group and all-groups views)
- [x] User profile page

### Not Completed

- [ ] Notification / reminder system for upcoming meetings (deferred from original plan)
- [ ] 80%+ unit test coverage across all apps (tests exist for `users`; other apps have partial coverage)
- [ ] End-to-end integration test suite
- [ ] Fully responsive / mobile-optimized design
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

## Team Communication

- **GitHub** — primary tool for version control, pull requests, and code review. Each feature was developed on a dedicated branch and merged via PR.
- **Discord** — used for daily team check-ins, sharing progress updates, and coordinating blockers between feature teams.
- **Shared documentation** — API contracts, workflow guides, and architecture decisions were documented in the `PROJECT_OVERVIEW/` folder and reviewed by all team members before implementation began.

## Team Responsibilities

| Team Member | Responsibilities |
|-------------|-----------------|
| **Eli** (Team A) | Django project initialization, custom User model, registration/login endpoints, JWT setup, token refresh and logout, user profile endpoint, login/register/profile React pages, `AuthContext`, deployment coordination |
| **Emiliano** (Team B) | `Group` and `GroupMember` models, invite code generation, Group CRUD endpoints, join-by-code endpoint, role-based permissions (`IsGroupOwner`, `IsGroupMember`), group list/create/join/detail React pages |
| **Fabrice** (Team C) | `Task` model, Task CRUD endpoints with status filtering and ordering, task assignment logic, TaskViewSet with `my_tasks` and `mark_complete` actions, Kanban task board, task create/detail React pages |
| **Ariana** (Team D) | `Meeting` model, Meeting CRUD endpoints, upcoming/past date filtering, creator-only edit/delete enforcement, meeting list/create/detail React components, calendar view integration |
| **Connor** (Team E) | `Message` model, messaging API with cursor pagination, message board React components (polling every 3 seconds), frontend folder structure, `App.js` routing, `Navigation` component, Dashboard page, shared component library (`Button`, `Input`, `Card`) |

## Reflections

The following findings come from our team retrospective meeting held at the end of the project.

### What the Team Learned

1. **API contracts are essential before parallel development begins.** Agreeing on exact endpoint URLs and request/response schemas in Week 1 allowed all five feature teams to work independently without blocking each other. Without this, integration would have been much harder.
2. **Git branch strategy requires active maintenance.** Regularly pulling from `develop` into feature branches and resolving conflicts incrementally is far less painful than large end-of-sprint merges. We learned this the hard way early in the project.
3. **Full-stack feature ownership (backend + frontend per person) is harder to coordinate than expected.** When one team member was behind on their backend, it also blocked their own frontend work, creating cascading delays.
4. **Authentication must be rock-solid before other features can be tested.** Almost every other feature depends on JWT tokens. Any instability in the auth layer during Weeks 2–3 slowed down all other teams who needed to test their endpoints.

### What Can Be Improved

1. **Testing should be integrated throughout development, not treated as a Week 10 task.** Writing tests alongside features would have caught regressions earlier and made integration easier.
2. **Mock data in the frontend should be replaced with real API calls sooner.** Relying on mock data until Week 6–7 meant that many integration bugs were discovered very late in the project timeline.
3. **Pull requests should be reviewed and merged more frequently.** Letting feature branches fall too far behind `develop` resulted in large conflicts that took significant time to resolve.
4. **Deployment should be configured in the first few weeks, not the last.** Environment-specific issues (environment variables, static file serving, database migrations) are much easier to debug when discovered early rather than right before the deadline.

### Future Plans for This Project

1. **Replace polling-based messaging with WebSockets** (Django Channels) to enable true real-time communication without the overhead of repeated HTTP requests every 3 seconds.
2. **Implement a notification and reminder system** for upcoming meetings, including in-app alerts and optional email notifications — this was deprioritized during development.
3. **Add file and resource sharing within groups** — the ability to upload documents, images, and links so all group materials live in one place alongside tasks and meetings.
4. **Build a mobile-responsive interface or a React Native companion app** so students can check group status, reply to messages, and update tasks from their phones.

---

## Instructions for Build and Use

Steps to build and/or run the software:

**Backend Setup:**
1. Clone the repository from GitHub
2. Create and activate a virtual environment: `python -m venv venv` and `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies using `pip install -r requirements.txt`
4. Start server with `python manage.py runserver` (port 8000)

**Frontend Setup:**
5. Navigate to the React frontend: `cd groupsync-frontend`
6. Install dependencies using `npm install`
7. Start React dev server with `npm start` (port 3000)

**Note:** Both servers need to run simultaneously for full functionality

Instructions for using the software:

1. Open a web browser and navigate to `http://localhost:3000` (frontend) or the deployed URL
2. Register a new account or log in with existing credentials
3. Create a group or join one using an invite code shared by a teammate
4. From the group workspace, manage tasks on the Kanban board, schedule meetings, and message your team
5. Use the Dashboard for a quick overview of everything happening across all your groups

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

* Python 3.10+
* Node.js 18+ (for React frontend)
* Django 4.2+
* Django REST Framework
* djangorestframework-simplejwt
* django-cors-headers

**To install Node.js on Windows:**
```
winget install OpenJS.NodeJS
```

Then restart your terminal for PATH changes to take effect.

## Useful Websites to Learn More

* [Django REST Framework documentation](https://www.django-rest-framework.org/)
* [React documentation](https://react.dev/)
* [djangorestframework-simplejwt](https://django-rest-framework-simplejwt.readthedocs.io/)
* [Render deployment documentation](https://render.com/docs)

## Future Work

* [ ] Real-time messaging with WebSockets (Django Channels)
* [ ] Notification and reminder system for upcoming meetings
* [ ] File and resource sharing within groups
* [ ] Mobile-responsive design and/or React Native app
* [ ] 80%+ unit test coverage across all apps
