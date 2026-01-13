# Team E: Frontend & Messaging Workflow

**Feature:** React SPA, dashboard, group workspace, task/meeting/members pages, polling message board  
**Estimated Hours:** 35–40  
**Team Size:** 1 person (or more if needed)  
**Timeline:** Weeks 1–7 (setup + mock), Weeks 8–11 (integration + polish)

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- Team A initializes Django backend (get repo link)
- Review API contract document from all teams

### Your Tasks
1. **Set up React project**
   - Create React app: `npx create-react-app groupsync-frontend`
   - Install dependencies: `axios` (HTTP), `react-router-dom` (routing), `date-fns` (date formatting)
   - Set up folder structure: `/src/components`, `/src/pages`, `/src/api`, `/src/hooks`

2. **Review API Contract**
   - Read API endpoint specifications from Teams A–D
   - Note all request/response schemas
   - Plan mock data structure that matches

3. **Plan Page Structure**
   - **Dashboard:** List of user's groups
   - **Group Workspace:**
     - Header: group name + invite code + members
     - Tabs: Tasks | Meetings | Members | Resources | Messages
   - **Task Board:** Kanban view (To-Do | Doing | Done) or list view
   - **Meetings:** Calendar or list view
   - **Members:** Simple list
   - **Resources:** Links list
   - **Messages:** Polling board (last 50 messages)

4. **Design Component Hierarchy**
   - Sketch component tree on paper/whiteboard
   - Plan state management approach (Context API vs Redux; start with Context for MVP)
   - Share design overview with team

### Deliverables by End of Week 1
- [ ] React project created and running
- [ ] Folder structure set up
- [ ] API contract reviewed and understood
- [ ] Component hierarchy planned
- [ ] Ready to start building UI

---

## Weeks 2–3: Layout & Mock Data (Jan 20–Feb 2)

### Prerequisites
- React project initialized
- API contract document ready

### Your Tasks
1. **Create Mock Data**
   - Build mock data that matches API schemas from Teams A–D
   - Example:
   ```javascript
   // src/mockData.js
   export const mockUser = {
     id: 1,
     username: 'john_doe',
     email: 'john@example.com'
   };
   
   export const mockGroups = [
     {
       id: 1,
       name: 'CSE 310 Project',
       owner_id: 1,
       invite_code: 'ABC12345',
       created_at: '2026-01-13T00:00:00Z'
     }
   ];
   
   export const mockTasks = [
     {
       id: 1,
       title: 'Setup database',
       status: 'doing',
       due_date: '2026-02-01T00:00:00Z',
       assigned_to: 1,
       group_id: 1,
       created_by: 1,
       created_at: '2026-01-13T00:00:00Z'
     }
   ];
   
   // ... and so on for meetings, messages, etc.
   ```

2. **Build Main Layout**
   - Create `App.js` with React Router
   - Create `Navigation` component (sidebar or navbar)
   - Create `Dashboard` page (shows user's groups)
   - Create `GroupWorkspace` page (main hub after clicking a group)

3. **Dashboard Page**
   - Display list of groups (use mock data)
   - Button to create group
   - Click group to enter workspace
   - Show invite code in each group card

4. **Group Workspace Layout**
   - Header: group name, invite code, member count
   - Tabs: Tasks | Meetings | Members | Resources | Messages
   - Tab switching logic (useState to track active tab)

### Code Example

```javascript
// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import GroupWorkspace from './pages/GroupWorkspace';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <Router>
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/groups/:groupId" element={<GroupWorkspace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

```javascript
// src/pages/GroupWorkspace.js
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockTasks, mockMeetings, mockMessages } from '../mockData';
import TaskBoard from '../components/TaskBoard';
import MeetingList from '../components/MeetingList';
import MembersList from '../components/MembersList';
import MessageBoard from '../components/MessageBoard';

function GroupWorkspace() {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState('tasks');
  
  return (
    <div className="group-workspace">
      <header>
        <h1>CSE 310 Project</h1>
        <p>Invite Code: ABC12345</p>
      </header>
      
      <nav className="tabs">
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={activeTab === 'meetings' ? 'active' : ''} 
          onClick={() => setActiveTab('meetings')}
        >
          Meetings
        </button>
        <button 
          className={activeTab === 'members' ? 'active' : ''} 
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button 
          className={activeTab === 'messages' ? 'active' : ''} 
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </nav>
      
      <div className="tab-content">
        {activeTab === 'tasks' && <TaskBoard tasks={mockTasks} />}
        {activeTab === 'meetings' && <MeetingList meetings={mockMeetings} />}
        {activeTab === 'members' && <MembersList />}
        {activeTab === 'messages' && <MessageBoard messages={mockMessages} />}
      </div>
    </div>
  );
}

export default GroupWorkspace;
```

### Deliverables by End of Week 3
- [ ] React project running with routing
- [ ] Mock data created for all features
- [ ] Dashboard page showing mock groups
- [ ] Group workspace with tabs
- [ ] Tab switching working
- [ ] Basic CSS for layout

---

## Weeks 4–5: Feature Components (Feb 3–16)

### Prerequisites
- Layout and routing complete
- Mock data ready

### Your Tasks
1. **Task Board Component**
   - Display tasks in 3 columns (To-Do | Doing | Done) OR as list
   - Show: title, due date, assigned person
   - Click task to see details
   - Mock: drag-and-drop between columns (optional, use hardcoded button for MVP)
   - Button to create new task
   - Don't fetch from API yet (use mock data)

2. **Meeting List Component**
   - Display upcoming meetings
   - Show: title, date/time, location/Zoom link
   - Click to see details
   - Button to create new meeting
   - Mock: sort by date
   - Don't fetch from API yet

3. **Members List Component**
   - Display group members
   - Show: name, role (Owner|Member), joined date
   - Don't fetch from API yet

4. **Resources Component**
   - Simple list of links
   - Show: title, URL
   - Button to add link
   - Click to open link
   - Don't fetch from API yet

### Code Example

```javascript
// src/components/TaskBoard.js
import { useState } from 'react';
import './TaskBoard.css';

function TaskBoard({ tasks }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    doing: tasks.filter(t => t.status === 'doing'),
    done: tasks.filter(t => t.status === 'done')
  };
  
  return (
    <div className="task-board">
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        + New Task
      </button>
      
      {showCreateForm && <TaskCreateForm />}
      
      <div className="columns">
        {['todo', 'doing', 'done'].map(status => (
          <div key={status} className="column">
            <h3>{status.toUpperCase()}</h3>
            {tasksByStatus[status].map(task => (
              <div key={task.id} className="task-card">
                <h4>{task.title}</h4>
                <p>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                <p>Assigned: {task.assigned_to || 'Unassigned'}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCreateForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  
  return (
    <form className="create-form">
      <input 
        type="text" 
        placeholder="Task title" 
        value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
      />
      <input 
        type="datetime-local" 
        value={formData.due_date}
        onChange={e => setFormData({...formData, due_date: e.target.value})}
      />
      <button type="submit">Create Task</button>
    </form>
  );
}

export default TaskBoard;
```

### Deliverables by End of Week 5
- [ ] Task board component (with columns or list)
- [ ] Create task form (mock submit)
- [ ] Meeting list component
- [ ] Members list component
- [ ] Resources list component
- [ ] All showing mock data
- [ ] Basic styling for all components

---

## Weeks 6–7: Message Board & Polishing (Feb 17–Mar 2)

### Prerequisites
- All feature components built
- Mock data working

### Your Tasks
1. **Message Board Component**
   - Display messages in reverse chronological order (newest first)
   - Show: username, timestamp, message text
   - Input form: text area + Send button
   - Mock: add message to local state on submit
   - Layout: chat-like interface
   - Don't fetch from API yet

2. **Login/Register Pages**
   - Simple login form (username, password)
   - Simple register form (username, email, password, confirm)
   - Mock: validate locally (non-empty fields)
   - Mock: store token in localStorage (don't actually call API)
   - Redirect to dashboard on success

3. **API Service Layer**
   - Create `src/api/client.js` with axios instance
   - Configure base URL (will be Django backend)
   - Add auth token to headers (will use JWT)
   - Create API functions (don't call them yet):
     ```javascript
     // src/api/client.js
     import axios from 'axios';
     
     const API_BASE = 'http://localhost:8000/api';
     
     export const apiClient = axios.create({
       baseURL: API_BASE,
       headers: {
         'Content-Type': 'application/json'
       }
     });
     
     // Add token to headers
     export const setAuthToken = (token) => {
       if (token) {
         apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
       } else {
         delete apiClient.defaults.headers['Authorization'];
       }
     };
     
     // Auth endpoints
     export const auth = {
       register: (username, email, password) => 
         apiClient.post('/users/register/', { username, email, password }),
       login: (username, password) => 
         apiClient.post('/users/login/', { username, password })
     };
     
     // Groups endpoints
     export const groups = {
       list: () => apiClient.get('/groups/'),
       create: (name) => apiClient.post('/groups/', { name }),
       getDetails: (id) => apiClient.get(`/groups/${id}/`),
       join: (inviteCode) => apiClient.post('/groups/join/', { invite_code: inviteCode })
     };
     
     // ... similar for tasks, meetings, messages
     ```

4. **Polish & Testing**
   - Add basic CSS styling (use simple color scheme)
   - Test all components with mock data
   - Test tab switching
   - Test form submissions (local)
   - Verify responsive layout

### Code Example

```javascript
// src/components/MessageBoard.js
import { useState } from 'react';
import './MessageBoard.css';

function MessageBoard({ groupId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author_id: 1,
      author: 'john_doe',
      text: 'Hey everyone!',
      created_at: '2026-01-13T10:00:00Z'
    },
    {
      id: 2,
      author_id: 2,
      author: 'jane_smith',
      text: 'Hi John!',
      created_at: '2026-01-13T10:05:00Z'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = {
      id: messages.length + 1,
      author_id: 1,
      author: 'current_user',
      text: newMessage,
      created_at: new Date().toISOString()
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };
  
  return (
    <div className="message-board">
      <div className="messages-list">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <strong>{msg.author}</strong>
            <span className="timestamp">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default MessageBoard;
```

### Deliverables by End of Week 7
- [ ] Message board component (with mock data)
- [ ] Login page (mock auth)
- [ ] Register page (mock auth)
- [ ] API client service layer created
- [ ] All components styled
- [ ] Frontend runs locally without errors
- [ ] Ready to integrate real APIs

---

## Weeks 8–9: API Integration & Polling (Mar 3–16)

### Prerequisites
- All components built with mock data
- Backend teams have working APIs (or close to it)
- API client service layer ready

### Your Tasks
1. **Swap Mock Data for Real APIs**
   - Update Dashboard to fetch real groups: `GET /api/groups/`
   - Update TaskBoard to fetch real tasks: `GET /api/groups/{id}/tasks/`
   - Update MeetingList to fetch real meetings: `GET /api/groups/{id}/meetings/`
   - Update MembersList to fetch real members: `GET /api/groups/{id}/members/`
   - Use `useEffect` to fetch on component mount
   - Handle loading/error states gracefully

2. **Implement Polling for Messages**
   - When user navigates to Messages tab, start polling
   - Fetch `GET /api/groups/{id}/messages/?since={timestamp}` every 3 seconds
   - Update message list with new messages
   - Stop polling when user leaves tab
   - Example:
   ```javascript
   useEffect(() => {
     const interval = setInterval(() => {
       const since = lastMessageTime || new Date(Date.now() - 60000); // Last 1 min
       fetch(`/api/groups/${groupId}/messages/?since=${since.toISOString()}`)
         .then(r => r.json())
         .then(data => setMessages([...messages, ...data]));
     }, 3000);
     
     return () => clearInterval(interval);
   }, [groupId]);
   ```

3. **Integrate Real Auth**
   - Update Login to call `POST /api/users/login/`
   - Update Register to call `POST /api/users/register/`
   - Store JWT token in localStorage
   - Pass token to all subsequent requests (via apiClient headers)
   - Redirect on auth success/failure

4. **Implement CRUD Operations**
   - Add real submit handlers for create/update/delete
   - Task: Create task → `POST /api/groups/{id}/tasks/`
   - Task: Update status → `PUT /api/groups/{id}/tasks/{id}/` or `PATCH /api/groups/{id}/tasks/{id}/status/`
   - Meeting: Create → `POST /api/groups/{id}/meetings/`
   - Message: Create → `POST /api/groups/{id}/messages/`
   - Handle errors gracefully (show error messages to user)

5. **Handle Backend Issues**
   - When backend team endpoint fails, show helpful error message
   - Test with Postman/curl first if React integration fails
   - Debug CORS issues (backend may need CORS configuration)
   - Verify JWT token is being sent correctly in headers

### Code Example (Real API Integration)

```javascript
// src/pages/GroupWorkspace.js (updated)
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { groups, tasks, messages } from '../api/client';

function GroupWorkspace() {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState('tasks');
  const [groupData, setGroupData] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupRes = await groups.getDetails(groupId);
        setGroupData(groupRes.data);
        
        const tasksRes = await tasks.list(groupId);
        setTaskList(tasksRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [groupId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="group-workspace">
      <header>
        <h1>{groupData.name}</h1>
        <p>Invite Code: {groupData.invite_code}</p>
      </header>
      
      {/* Tab switching logic */}
      {activeTab === 'tasks' && <TaskBoard tasks={taskList} groupId={groupId} />}
      {/* ... other tabs */}
    </div>
  );
}

export default GroupWorkspace;
```

### Deliverables by End of Week 9
- [ ] Real API integration complete (tasks, meetings, members)
- [ ] Polling message board working (3-second refresh)
- [ ] Real authentication working (JWT tokens)
- [ ] Create/update/delete operations working
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Frontend fully integrated with backend
- [ ] No console errors

---

## Weeks 10–11: Styling, Testing & Deployment (Mar 17–Apr 1)

### Prerequisites
- All APIs integrated and working
- All CRUD operations working
- Polling working

### Your Tasks
1. **UI Polish**
   - Improve CSS (colors, spacing, fonts)
   - Make responsive for mobile
   - Add icons (optional, use emoji or simple symbols for MVP)
   - Test on different screen sizes

2. **Error Handling & Edge Cases**
   - Show user-friendly error messages
   - Handle empty states (no tasks, no meetings, etc.)
   - Handle network errors gracefully
   - Test invalid inputs

3. **Testing**
   - Manual test all features end-to-end
   - Test with real backend data
   - Test create/update/delete operations
   - Test authentication flow
   - Test message polling

4. **Build for Production**
   - Run `npm run build` (creates optimized build)
   - Test build locally: `serve -s build`
   - Verify all features work in production build

5. **Deploy to Render**
   - Push React build folder to GitHub
   - Create Render static site from build
   - Or: Configure Django to serve React build (single deployment)
   - Test on live Render URL

### Deliverables by April 1
- [ ] UI fully styled and polished
- [ ] All features tested end-to-end
- [ ] No console errors or warnings
- [ ] Responsive design working
- [ ] Production build created
- [ ] Deployed to Render
- [ ] Live URL working

---

## Dependencies

Add to `package.json`:
```json
"dependencies": {
  "axios": "^1.6",
  "react": "^18.2",
  "react-dom": "^18.2",
  "react-router-dom": "^6.8",
  "date-fns": "^2.29"
}
```

---

## Folder Structure (Target)

```
src/
├── api/
│   └── client.js          # Axios instance + API functions
├── components/
│   ├── Navigation.js
│   ├── TaskBoard.js
│   ├── MeetingList.js
│   ├── MessageBoard.js
│   ├── MembersList.js
│   └── ResourcesList.js
├── pages/
│   ├── Dashboard.js
│   ├── GroupWorkspace.js
│   ├── Login.js
│   └── Register.js
├── hooks/
│   └── useAuth.js         # Custom hook for auth state
├── App.js
├── index.js
└── App.css
```

---

## Key Integration Points

- **Auth:** Store JWT token in localStorage, pass in `Authorization: Bearer {token}` header
- **Group queries:** Always include group_id in URL path
- **Task/Meeting filtering:** Use query params (`?status=todo`, `?upcoming=true`)
- **Message polling:** Fetch every 3 seconds, filter by `since=timestamp`
- **CORS:** Backend must have CORS headers enabled for frontend domain

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Check backend has CORS enabled; test with curl first |
| 401 Unauthorized | Verify JWT token is in localStorage and header |
| 404 Not Found | Verify API endpoint URL and group_id parameter |
| Polling not working | Check fetch interval is running; verify backend returns new messages |
| Forms not submitting | Check form data structure matches API spec |

---

## Notes

- **Start with mock data immediately** (week 2) — don't wait for backend
- **Integrate incrementally** (week 8 onwards) — test one feature at a time
- **Ask for help early** — if backend endpoint not matching spec, escalate Monday
- **Document your API calls** — write comments showing expected response shape
- **Test extensively** — this is the face of the app!
