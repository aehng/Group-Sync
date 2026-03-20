# Team E: Messaging & Frontend Polish Workflow

## Time Log

| Date       | Hours Worked | Description of Work                                           |
|------------|--------------|---------------------------------------------------------------|
| 2026-01-14 | 1            | Set up venv by following the readme.md                        |
| 2026-01-16 | 1            | Set up frontend React and Django.                             |
| 2026-01-20 | 2            | Fixing venv and resolving git issues.                         |
| 2026-01-21 | 1            | Resolving more git issues.                                    |
| 2026-01-23 | 1            | Set up messaging.                                             |
| 2026-01-28 | 1            | Messaging endpoints and basic integration.                    |
| 2026-03-11 | 4            | Weeks 8-9: Added missing API endpoints, fixed backend setup. |

**Feature:** Message board with polling (Backend + Frontend), UI/UX design, responsive styling, consistent layout, dashboard navigation  
**Estimated Hours:** 30–35  
**Team Size:** 1 person  
**Timeline:** Weeks 1-3 (messaging backend), Weeks 4-5 (design system + message board UI), Weeks 6-7 (polish + integration), Weeks 8–11 (final integration & deployment)

**Note:** Team A (Eli) handles authentication backend (Weeks 2-5) and frontend pages (Weeks 4-5). You focus on messaging backend first, then design system. This gives you realistic time to build both properly.

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- Team A initializes Django backend
- Review API contract from all teams

### Your Tasks
1. **Set up React project**
   - [x] If not already created: `npx create-react-app groupsync-frontend`
   - [x] Install dependencies: `axios` (HTTP), `react-router-dom` (routing), `date-fns` (date formatting)
   - [x] Set up folder structure: `/src/components`, `/src/pages`, `/src/api`, `/src/hooks`, `/src/styles`

2. **Git branch setup**
   - [x] Create branches: `develop`, `feature/messaging`, `feature/ui-polish`
   - [x] Work on `feature/messaging` for messaging backend + frontend
   - [x] Work on `feature/ui-polish` for UI improvements

3. **Review API Contracts**
   - [x] Read API endpoint specifications from Teams A–D
   - [x] Note all request/response schemas
   - [x] Understand how other teams' components should be structured

4. **Define Design System** (Basic)
   - [x] Choose simple color palette (primary, secondary, accent, error, success)
   - [x] Choose fonts (heading, body)
   - [x] Create basic CSS variables in `styles/theme.css`
   - [x] Design 2-3 button styles and input field styles
   - [x] Create shared Button, Input, Card components
   - [x] Share with team for feedback

5. **Plan Messaging Feature**
   - [x] Design Message model for backend
   - [x] Plan polling strategy (3-second interval initially)
   - [x] Sketch message board UI layout

### Deliverables by End of Week 1
- [x] React project set up and running
- [x] Basic design system and shared components created
- [x] Messaging feature planned
- [x] Ready to start messaging backend work

---

## Weeks 2–3: Messaging Backend (Jan 20–Feb 2)

### Prerequisites
- React project set up
- Team A's User model and auth understood
- Team B's Group model understood

### Your Tasks
1. **Create `messaging` App**
   - [X] `python manage.py startapp messaging`
   - [X] Add to `INSTALLED_APPS` in `settings.py`

2. **Message Model**
   - [X] Create Message model with fields: `id`, `group` (FK to Group), `author` (FK to User), `text`, `created_at`
   - [X] Write migration

3. **Message Serializers**
   - [X] Create `MessageSerializer` for CRUD operations
   - [X] Include nested User info (username) for author
   - [X] Include nested Group info

4. **Message Endpoints**
   - [X] `GET /api/groups/{id}/messages/` — List messages for a group (ordered by created_at)
   - [X] `POST /api/groups/{id}/messages/` — Create new message
   - [X] Add pagination (last 50 messages)
   - [X] Require JWT authentication

### Code Example

```python
# messages/models.py
from django.db import models
from django.contrib.auth import get_user_model
from groups.models import Group

User = get_user_model()

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.author.username}: {self.text[:50]}"
    
    class Meta:
        ordering = ['-created_at']
```

### Deliverables by End of Week 3
- [X] Message model created with migrations
- [X] Message serializer written
- [X] Message endpoints ready for implementation


## Weeks 4–5: Design System + Message Board Frontend (Feb 3–16)

### Prerequisites
- Message backend partially implemented
- React project ready

### Your Tasks (Frontend - Priority)
1. **Define Design System** (Create for all teams to use)
   - [X] Choose simple color palette (primary, secondary, accent, error, success)
   - [X] Choose fonts (heading, body)
   - [X] Create CSS variables in `styles/theme.css`
   - [X] Design 2-3 button styles and input field styles

2. **Build Shared Components** (For Team A and other teams to use)
   - [X] Create simple `Button.js` component with variants
   - [X] Create `Input.js` component with validation states
   - [X] Create `Card.js` component
   - [X] Create `Loading.js` spinner
   - [X] Create `Error.js` error message
   - [X] Create `Success.js` success notification
   - [X] Export all from `/src/components/shared/index.js`
   - [X] Document component props and usage

3. **Message Board Frontend**
   - [X] Create `MessageBoard.js` component
   - [X] Fetch messages from backend API (with JWT)
   - [X] Display messages in chat-like format
   - [X] Auto-scroll to latest message
   - [X] Add text area and Send button
   - [X] Handle form submission (POST to `/api/groups/{id}/messages/`)
   - [X] Clear input after send

### Your Tasks (Backend - Secondary)
1. **Build Message Endpoints**
   - [X] Implement `GET /api/groups/{id}/messages/` endpoint with pagination
   - [X] Implement `POST /api/groups/{id}/messages/` endpoint
   - [X] Permission checks (only group members)

2. **Unit Tests**
   - [X] Test message creation and retrieval
   - [X] Test permission enforcement
   - [X] Aim for 80%+ coverage

### Code Example (Shared Components)

```javascript
// src/components/shared/Button.js
function Button({ children, onClick, variant = 'primary', disabled = false }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// src/components/shared/Input.js
function Input({ type = 'text', placeholder, value, onChange, error = false }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input ${error ? 'input-error' : ''}`}
    />
  );
}
```

### Deliverables by End of Week 5
- [X] Complete design system (colors, fonts, CSS variables)
- [X] All shared components built and documented
- [X] Shared components exported from `/src/components/shared/index.js`
- [X] Message endpoints implemented and tested
- [X] Message board component integrated with API
- [X] Design system shared with all teams

---

## Weeks 6–7: Message Board Frontend & Integration (Feb 17–Mar 2)

### Prerequisites
- Message backend endpoints complete
- React structure set up
- Design system in place

### Your Tasks
1. **Message Board Component**
   - [X] Create `MessageBoard.js` component
   - [X] Fetch messages from backend API (with JWT)
   - [X] Display messages in chat-like format
   - [X] Auto-scroll to latest message

2. **Send Message Form**
   - [X] Add text area and Send button
   - [X] Handle form submission (POST to `/api/groups/{id}/messages/`)
   - [X] Clear input after send
   - [X] Show errors if submission fails

3. **Polling Implementation**
   - [X] Use `setInterval()` to poll every 3 seconds
   - [X] Fetch new messages automatically
   - [X] Update message list
   - [X] Clean up interval on unmount

4. **Apply Design System**
   - [X] Style message board with consistent colors/fonts
   - [X] Ensure responsive design (mobile-friendly)
   - [X] Add loading and error states

### Code Example

```javascript
// src/components/MessageBoard.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function MessageBoard({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8000/api/groups/${groupId}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8000/api/groups/${groupId}/messages/`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="message-board">
      <div className="messages-list">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <strong>{msg.author.username}</strong>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage}>
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default MessageBoard;
```

### Deliverables by End of Week 7
- [X] Message board component integrated with real API
- [X] Send message functionality working
- [X] Polling every 3 seconds functional
- [X] Styled with design system
- [X] Responsive design tested

---

## Weeks 8–9: UI Polish & Integration (Mar 3–16)

### Prerequisites
- Message board complete
- All other teams have backend endpoints complete
- Design system established

### Your Tasks
1. **Integrate Real Data from Other Teams**
   - [X] Update Dashboard to fetch real groups: `GET /api/groups/`
   - [X] Update GroupWorkspace to display Tasks, Meetings, Members (via mock or basic API calls)
   - [X] Handle loading and error states for all data fetches
   - [X] Use `useEffect` to fetch on component mount

2. **Polish Message Board**
   - [X] Optimize polling (can increase to 5 sec if needed)
   - [X] Add relative timestamps ("2 min ago")
   - [X] Add message author info clearly
   - [X] Test with high message volume

3. **UI/UX Improvements**
   - [X] Add loading spinners for API calls
   - [X] Add error messages for failed requests
   - [X] Add success notifications for sent messages
   - [X] Improve responsive design (test on mobile)
   - [X] Ensure consistent spacing and alignment

4. **Shared Component Review** (Coordinate with Teams A-D)
   - [X] Review components from other teams
   - [X] Apply consistent styling
   - [X] Help other teams use shared components
   - [X] Document component usage for team

### Code Example (Shared Components)

```javascript
// src/components/shared/Button.js
function Button({ children, onClick, variant = 'primary', disabled = false }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// src/components/shared/Card.js
function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}
```

```css
/* src/styles/theme.css */
:root {
  --primary: #007bff;
  --secondary: #6c757d;
  --success: #28a745;
  --error: #dc3545;
  --spacing: 8px;
  --border-radius: 4px;
}

.btn {
  padding: calc(var(--spacing) * 1.25) calc(var(--spacing) * 2.5);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 16px;
}

.card {
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  padding: var(--spacing) * 2;
  margin: var(--spacing);
}
```

### Deliverables by End of Week 9
- [X] Real API integration complete (groups, tasks, meetings, members)
- [X] Message board polished and optimized
- [X] UI components styled consistently
- [X] Loading/error/success states throughout
- [X] Responsive design working on all devices
- [X] Shared components documented
- [X] Backend API routes added for all resources

---

## Weeks 10–11: Testing, Optimization & Deployment (Mar 17–Apr 1)

### Prerequisites
- All features integrated and working
- Design system applied throughout

### Your Tasks
1. **Final Testing**
  - [X] End-to-end testing (register → login → create group → send messages)
  - [X] Test all CRUD operations
   - [ ] Test on multiple browsers (Chrome, Firefox, Safari)
   - [ ] Test responsive design on mobile/tablet
  - [X] Fix any bugs found 

2. **Performance & Optimization**
  - [X] Optimize polling frequency (adjust if needed)
  - [X] Minimize bundle size
  - [X] Test load times
   - [X] Optimize message list rendering (virtualization if needed)

3. **Polish & UX**
  - [X] Improve message timestamps and formatting
  - [X] Add animations/transitions (optional)
  - [X] Review accessibility (ARIA labels, keyboard nav)
  - [X] Final visual consistency check

4. **Deployment**
  - [X] Build production version: `npm run build`
  - [X] Test production build locally
   - [ ] Deploy frontend to hosting (Render, Vercel, etc.)
   - [ ] Configure CORS for production domain
   - [ ] Test on live URL

5. **Documentation**
  - [X] Update README with setup instructions
  - [X] Document design system
  - [X] Create component usage guide
  - [X] Document any custom hooks/utilities

### Deliverables by April 1
- [X] All features tested and working
- [X] Performance optimized
- [ ] Deployed to production
- [X] No console errors or warnings
- [X] Documentation complete
- [ ] App fully functional live

### Week 10-11 Progress Update (Mar 18, 2026)
- Backend validation complete: `python manage.py test` passed (`57/57` tests).
- Frontend API tests complete: `npm test -- --watchAll=false src/api` passed (`20/20` tests).
- End-to-end API smoke flow complete: register, login, create group, post/list messages (`SMOKE_OK`).
- Deployment prep complete: production build succeeds and local production server returns HTTP `200`.
- Lint/build warning cleanup complete: `npm run build` now compiles successfully with no ESLint warnings.

### Week 10-11 Progress Update (Mar 20, 2026)
- Messaging component + hook tests passed: `npm test -- --watchAll=false src/components/MessageBoard.test.js src/hooks/useMessages.test.js` (`14/14` tests).
- Production build verification complete: `npm run build` succeeded; output size: `main.js 113.44 kB`, `main.css 1.93 kB`, chunk `1.76 kB` (gzip).
- Local production load-time sampling complete (5 runs at `http://localhost:3100`): avg `185.58ms`, min `116.14ms`, max `446.23ms`.
- Message UX improvements complete: relative + absolute timestamps, transitions, ARIA roles/live regions, focus styling, and memoized message rendering.
- Final visual consistency pass complete: spacing, border radius, focus styling, and feedback states are aligned across message board, bubble, and composer surfaces.
- Frontend documentation complete in `groupsync-frontend/README.md` (setup, design system, shared components, hooks/utilities).
- Remaining blockers are external/manual: cross-browser matrix validation, real-device responsive verification, production deploy target, production CORS domain, and live URL verification.

---

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/groups/{id}/messages/` | GET | Yes | List messages for group |
| `/api/groups/{id}/messages/` | POST | Yes | Create new message |

---

## Key Responsibilities

1. **Messaging Backend** - Own the Message model and endpoints end-to-end
2. **React Frontend** - Build the core app structure and routing
3. **Design System** - Establish and maintain consistent UI/UX
4. **Message Board UI** - Create real-time chat interface with polling
5. **Integration** - Coordinate with Teams A-D to integrate their features

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Polling causes lag | Increase interval to 5-10 seconds or optimize query |
| CORS errors | Backend needs CORS configuration for frontend domain |
| JWT token not working | Verify token is in localStorage and sent in headers |
| Message board not updating | Check if polling interval is running and API returns data |

---

## Notes for Success

- **Start messaging backend early** (Week 2) — don't wait for other teams
- **Coordinate with Team A** on React project setup
- **Keep design system simple** — colors, fonts, and basic components only
- **Test frequently** — especially polling and real-time updates
- **Help other teams integrate** — review their frontend code and suggest UI improvements
