# Team E: Messaging & Frontend Polish Workflow

## Time Log

| Date       | Hours Worked | Description of Work                  |
|------------|--------------|--------------------------------------|
| YYYY-MM-DD | X            | Brief description of tasks completed |

---

**Feature:** Message board with polling (Backend + Frontend), UI/UX design, responsive styling, consistent layout, dashboard navigation  
**Estimated Hours:** 30–35  
**Team Size:** 1 person  
**Timeline:** Weeks 1–7 (messaging backend + UI/UX foundation), Weeks 8–11 (integration & final polish)

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- Team A initializes Django backend
- Review API contract from all teams

### Your Tasks
1. **Set up React project**
   - [ ] If not already created: `npx create-react-app groupsync-frontend`
   - [ ] Install dependencies: `axios` (HTTP), `react-router-dom` (routing), `date-fns` (date formatting)
   - [ ] Set up folder structure: `/src/components`, `/src/pages`, `/src/api`, `/src/hooks`, `/src/styles`

2. **Git branch setup**
   - [ ] Create branches: `develop`, `feature/messaging`, `feature/ui-polish`
   - [ ] Work on `feature/messaging` for messaging backend + frontend
   - [ ] Work on `feature/ui-polish` for UI improvements

3. **Review API Contracts**
   - [ ] Read API endpoint specifications from Teams A–D
   - [ ] Note all request/response schemas
   - [ ] Understand how other teams' components should be structured

4. **Define Design System** (Basic)
   - [ ] Choose simple color palette (primary, secondary, accent, error, success)
   - [ ] Choose fonts (heading, body)
   - [ ] Create basic CSS variables in `styles/theme.css`
   - [ ] Design 2-3 button styles and input field styles
   - [ ] Share with team for feedback

5. **Plan Messaging Feature**
   - [ ] Design Message model for backend
   - [ ] Plan polling strategy (3-second interval initially)
   - [ ] Sketch message board UI layout

### Deliverables by End of Week 1
- [ ] React project set up
- [ ] Basic design system (colors, fonts, basic components)
- [ ] Messaging feature planned
- [ ] Ready to start backend and frontend work

---

## Weeks 2–3: Messaging Backend (Jan 20–Feb 2)

### Prerequisites
- React project set up
- Team A's User model and auth understood
- Team B's Group model understood

### Your Tasks
1. **Create `messages` App**
   - [ ] `python manage.py startapp messages`
   - [ ] Add to `INSTALLED_APPS` in `settings.py`

2. **Message Model**
   - [ ] Create Message model with fields: `id`, `group` (FK to Group), `author` (FK to User), `text`, `created_at`
   - [ ] Write migration

3. **Message Serializers**
   - [ ] Create `MessageSerializer` for CRUD operations
   - [ ] Include nested User info (username) for author
   - [ ] Include nested Group info

4. **Message Endpoints**
   - [ ] `GET /api/groups/{id}/messages/` — List messages for a group (ordered by created_at)
   - [ ] `POST /api/groups/{id}/messages/` — Create new message
   - [ ] Add pagination (last 50 messages)
   - [ ] Require JWT authentication

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
- [ ] Message model created with migrations
- [ ] Message serializer written
- [ ] Message endpoints ready for implementation

---

## Weeks 4–5: Message Endpoints & Frontend Setup (Feb 3–16)

### Prerequisites
- Message model created
- Team A & B's endpoints working

### Your Tasks (Backend)
1. **Build Message Endpoints**
   - [ ] `GET /api/groups/{id}/messages/` endpoint with pagination
   - [ ] `POST /api/groups/{id}/messages/` endpoint
   - [ ] Permission checks (only group members)

2. **Unit Tests**
   - [ ] Test message creation and retrieval
   - [ ] Test permission enforcement
   - [ ] Aim for 80%+ coverage

### Your Tasks (Frontend)
1. **Create App Structure**
   - [ ] Create `App.js` with React Router
   - [ ] Create `Navigation` component (sidebar/navbar)
   - [ ] Create `Dashboard` page (shows user's groups via mock data)
   - [ ] Create `GroupWorkspace` page with tab switching

2. **Set Up Shared Components** (Basic)
   - [ ] Create simple `Button.js` component
   - [ ] Create `Input.js` component
   - [ ] Create `Card.js` component
   - [ ] Apply design system colors/fonts

### Code Example (Frontend Structure)

```javascript
// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import GroupWorkspace from './pages/GroupWorkspace';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/groups/:groupId" element={<GroupWorkspace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Deliverables by End of Week 5
- [ ] Message endpoints working and tested
- [ ] React router configured
- [ ] Dashboard and workspace pages created
- [ ] Basic shared components (Button, Input, Card)

---

## Weeks 6–7: Message Board Frontend & Integration (Feb 17–Mar 2)

### Prerequisites
- Message backend endpoints complete
- React structure set up
- Design system in place

### Your Tasks
1. **Message Board Component**
   - [ ] Create `MessageBoard.js` component
   - [ ] Fetch messages from backend API (with JWT)
   - [ ] Display messages in chat-like format
   - [ ] Auto-scroll to latest message

2. **Send Message Form**
   - [ ] Add text area and Send button
   - [ ] Handle form submission (POST to `/api/groups/{id}/messages/`)
   - [ ] Clear input after send
   - [ ] Show errors if submission fails

3. **Polling Implementation**
   - [ ] Use `setInterval()` to poll every 3 seconds
   - [ ] Fetch new messages automatically
   - [ ] Update message list
   - [ ] Clean up interval on unmount

4. **Apply Design System**
   - [ ] Style message board with consistent colors/fonts
   - [ ] Ensure responsive design (mobile-friendly)
   - [ ] Add loading and error states

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
- [ ] Message board component integrated with real API
- [ ] Send message functionality working
- [ ] Polling every 3 seconds functional
- [ ] Styled with design system
- [ ] Responsive design tested

---

## Weeks 8–9: UI Polish & Integration (Mar 3–16)

### Prerequisites
- Message board complete
- All other teams have backend endpoints complete
- Design system established

### Your Tasks
1. **Integrate Real Data from Other Teams**
   - [ ] Update Dashboard to fetch real groups: `GET /api/groups/`
   - [ ] Update GroupWorkspace to display Tasks, Meetings, Members (via mock or basic API calls)
   - [ ] Handle loading and error states for all data fetches
   - [ ] Use `useEffect` to fetch on component mount

2. **Polish Message Board**
   - [ ] Optimize polling (can increase to 5 sec if needed)
   - [ ] Add relative timestamps ("2 min ago")
   - [ ] Add message author info clearly
   - [ ] Test with high message volume

3. **UI/UX Improvements**
   - [ ] Add loading spinners for API calls
   - [ ] Add error messages for failed requests
   - [ ] Add success notifications for sent messages
   - [ ] Improve responsive design (test on mobile)
   - [ ] Ensure consistent spacing and alignment

4. **Shared Component Review** (Coordinate with Teams A-D)
   - [ ] Review components from other teams
   - [ ] Apply consistent styling
   - [ ] Help other teams use shared components
   - [ ] Document component usage for team

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
- [ ] Real API integration complete (groups, tasks, meetings, members)
- [ ] Message board polished and optimized
- [ ] UI components styled consistently
- [ ] Loading/error/success states throughout
- [ ] Responsive design working on all devices
- [ ] Shared components documented

---

## Weeks 10–11: Testing, Optimization & Deployment (Mar 17–Apr 1)

### Prerequisites
- All features integrated and working
- Design system applied throughout

### Your Tasks
1. **Final Testing**
   - [ ] End-to-end testing (register → login → create group → send messages)
   - [ ] Test all CRUD operations
   - [ ] Test on multiple browsers (Chrome, Firefox, Safari)
   - [ ] Test responsive design on mobile/tablet
   - [ ] Fix any bugs found

2. **Performance & Optimization**
   - [ ] Optimize polling frequency (adjust if needed)
   - [ ] Minimize bundle size
   - [ ] Test load times
   - [ ] Optimize message list rendering (virtualization if needed)

3. **Polish & UX**
   - [ ] Improve message timestamps and formatting
   - [ ] Add animations/transitions (optional)
   - [ ] Review accessibility (ARIA labels, keyboard nav)
   - [ ] Final visual consistency check

4. **Deployment**
   - [ ] Build production version: `npm run build`
   - [ ] Test production build locally
   - [ ] Deploy frontend to hosting (Render, Vercel, etc.)
   - [ ] Configure CORS for production domain
   - [ ] Test on live URL

5. **Documentation**
   - [ ] Update README with setup instructions
   - [ ] Document design system
   - [ ] Create component usage guide
   - [ ] Document any custom hooks/utilities

### Deliverables by April 1
- [ ] All features tested and working
- [ ] Performance optimized
- [ ] Deployed to production
- [ ] No console errors or warnings
- [ ] Documentation complete
- [ ] App fully functional live

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
