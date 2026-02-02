# Team C: Tasks Workflow

## Time Log

| Date       | Hours Worked | Description of Work                  |
|------------|--------------|--------------------------------------|
| YYYY-MM-DD | X            | Brief description of tasks completed |

---

# Team C: Tasks Workflow

**Feature:** Task CRUD, status management, assignments, due dates, filtering (Backend + Frontend)  
**Estimated Hours:** 30–35  
**Team Size:** 1 person  
**Timeline:** Weeks 1–7 (backend + frontend), Weeks 8–11 (integration & refinement)

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- Team A initializes Django project (start setup before they finish)

### Your Tasks
1. **Set up development environment**
   - [x] Clone/pull Team A's repository
   - [x] Create virtual environment
   - [x] Install dependencies from `requirements.txt`
   - [x] Verify Djandego runs locally

2. **Git branch setup**
   - [x] Create branches: `develop`, `feature/tasks`
   - [x] Work on `feature/tasks` for all task-related features

3. **Understand dependencies**
   - [x] Review Team A's User model structure
   - [x] Review Team B's Group/GroupMember models
   - [x] Plan how Task will reference Group, User (assigned_to), User (created_by)

4. **Create `tasks` app**
   - [x] `python manage.py startapp tasks`
   - [x] Add to `INSTALLED_APPS` in `settings.py`

5. **Plan Task workflow**
   - [x] Sketch out Task statuses: `todo`, `doing`, `done`
   - [x] Plan fields: title, description, due_date, assigned_to, status, group_id, created_by
   - [x] Decide: can unassigned tasks exist? (yes for MVP)
   - [x] Share design with teams for feedback

### Deliverables by End of Week 1
- [x] Development environment set up
- [x] `tasks` app created
- [x] Task model design finalized
- [x] Ready to start coding

---

## Weeks 2–3: Task Model & Serializers (Jan 20–Feb 2)

### Prerequisites
- Django project running
- Team A's User model understood
- Team B's Group model understood

### Your Tasks
1. **Task Model**
   - [x] Fields: `id`, `group` (FK to Group), `title`, `description`, `status`, `due_date`, `assigned_to` (FK to User, nullable), `created_by` (FK to User), `created_at`, `updated_at`
   - [x] Status choices: `todo`, `doing`, `done`
   - [x] Validators: title not empty (max 200 chars), description (max 2000 chars)
   - [x] Write migration

2. **Serializers**
   - [x] `TaskSerializer` for CRUD operations
   - [x] Include nested User info (username, email) for assigned_to and created_by
   - [x] Include nested Group info

### Code Example

```python
# tasks/models.py
from django.db import models
from django.contrib.auth import get_user_model
from groups.models import Group

User = get_user_model()

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('doing', 'Doing'),
        ('done', 'Done'),
    ]
    
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='todo')
    due_date = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
```

### Deliverables by End of Week 3
- [x] Task model with migrations
- [x] Task serializers created and tested
- [x] Ready to build endpoints

---

## Weeks 4–5: CRUD Endpoints (Feb 3–16)

### Prerequisites
- Task model and serializers complete
- Team A's auth working (JWT tokens)
- Team B's groups working

### Your Tasks
1. **List Tasks Endpoint**
  - [x] `GET /api/groups/{group_id}/tasks/`
  - [x] Return: All tasks in group
  - [x] Filter by status: `?status=todo` (optional)
  - [x] Filter by assigned_to: `?assigned_to={user_id}` (optional)
  - [x] Only group members can view

2. **Get Single Task Endpoint**
   - [ ] `GET /api/groups/{group_id}/tasks/{task_id}/`
   - [ ] Return: Full task details with assignee info
   - [ ] Only group members can view

3. **Create Task Endpoint**
   - [ ] `POST /api/groups/{group_id}/tasks/`
   - [ ] Accept: `title`, `description` (optional), `due_date` (optional), `assigned_to` (optional)
   - [ ] Auto-set `created_by` to authenticated user
   - [ ] Auto-set `status` to `todo`
   - [ ] Only group members can create

4. **Update Task Endpoint**
   - [ ] `PUT /api/groups/{group_id}/tasks/{task_id}/`
   - [ ] Accept: `title`, `description`, `status`, `due_date`, `assigned_to` (any field optional)
   - [ ] Only creator or assignee can update (or owner of group)
   - [ ] Return: Updated task

5. **Delete Task Endpoint**
   - [ ] `DELETE /api/groups/{group_id}/tasks/{task_id}/`
   - [ ] Only creator or group owner can delete
   - [ ] Return: 204 No Content

6. **Status Update Endpoint** (Optional, but recommended)
   - [ ] `PATCH /api/groups/{group_id}/tasks/{task_id}/status/`
   - [ ] Accept: `status` (todo|doing|done)
   - [ ] Quick way to move task between columns
   - [ ] Returns: Updated task

### Code Example

```python
# tasks/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from groups.models import Group, GroupMember
from .models import Task
from .serializers import TaskSerializer

class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id):
        # Check if user is group member
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        tasks = Task.objects.filter(group=group)
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(group=group, created_by=request.user)
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id, task_id):
        try:
            group = Group.objects.get(id=group_id)
            task = Task.objects.get(id=task_id, group=group)
        except (Group.DoesNotExist, Task.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    def put(self, request, group_id, task_id):
        try:
            group = Group.objects.get(id=group_id)
            task = Task.objects.get(id=task_id, group=group)
        except (Group.DoesNotExist, Task.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission: creator, assignee, or group owner
        is_creator = task.created_by == request.user
        is_assignee = task.assigned_to == request.user
        is_owner = group.owner == request.user
        
        if not (is_creator or is_assignee or is_owner):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, group_id, task_id):
        try:
            group = Group.objects.get(id=group_id)
            task = Task.objects.get(id=task_id, group=group)
        except (Group.DoesNotExist, Task.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if task.created_by != request.user and group.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### Deliverables by End of Week 5
- [ ] List tasks endpoint working
- [ ] Get single task endpoint working
- [ ] Create task endpoint working
- [ ] Update task endpoint working
- [ ] Delete task endpoint working
- [ ] Status update endpoint working (optional)
- [ ] All endpoints tested with Postman/curl

---

## Weeks 6–7: Testing & Integration (Feb 17–Mar 2)

### Prerequisites
- All CRUD endpoints working
- Team A & B fully integrated

### Your Tasks
1. **Permission Verification**
   - [ ] Only group members can view/create tasks
   - [ ] Only creator/assignee/owner can update
   - [ ] Only creator/owner can delete
   - [ ] Test all edge cases

2. **Unit Tests**
   - [ ] Test task creation
   - [ ] Test status updates
   - [ ] Test filtering by status
   - [ ] Test permission enforcement
   - [ ] Aim for 80%+ coverage

3. **Integration Testing**
   - [ ] Verify Task endpoints work with Group structure
   - [ ] Test Team E's ability to query tasks
   - [ ] Help with any group/task relationship questions

4. **Edge Cases**
   - [ ] What happens if assigned user is removed from group?
   - [ ] Handle null assigned_to gracefully
   - [ ] Handle deleted users gracefully

### Test Example

```python
# tasks/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from groups.models import Group, GroupMember
from .models import Task

User = get_user_model()

class TaskTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.group = Group.objects.create(name='Test Group', owner=self.user1)
        GroupMember.objects.create(group=self.group, user=self.user1, role='owner')
        GroupMember.objects.create(group=self.group, user=self.user2, role='member')
    
    def test_create_task(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/groups/{self.group.id}/tasks/', {
            'title': 'Test Task',
            'description': 'Test description'
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'todo')
    
    def test_non_member_cannot_view(self):
        user3 = User.objects.create_user(username='user3', password='pass')
        self.client.force_authenticate(user=user3)
        response = self.client.get(f'/api/groups/{self.group.id}/tasks/')
        self.assertEqual(response.status_code, 403)
```

### Deliverables by End of Week 7
- [ ] Unit tests written and passing
- [ ] Permission system tested thoroughly
- [ ] Integration testing complete
- [ ] All bugs fixed

---

## Weeks 8–9: React Frontend Development (Mar 3–16)

### Prerequisites
- Backend task endpoints complete and tested
- Group context available from Team B
- React project set up (coordinate with Team E for shared components)

### Your Tasks
- [ ] **Task Board/List Page**
  - [ ] Create `TaskBoard.js` component to display tasks by status
  - [ ] Fetch tasks with `axios.get('/api/groups/{id}/tasks/')` with JWT token
  - [ ] Display tasks in 3 columns: To-Do, Doing, Done (Kanban style)
  - [ ] Allow filtering by status, assigned user, due date
  - [ ] Add button to create new task

- [ ] **Create Task Form**
  - [ ] Create `CreateTask.js` component with fields: title, description, due_date, assigned_to
  - [ ] Handle form submission with `axios.post('/api/groups/{id}/tasks/')`
  - [ ] Fetch group members for assigned_to dropdown
  - [ ] Display validation errors

- [ ] **Task Details/Edit Page**
  - [ ] Create `TaskDetails.js` component to display full task info
  - [ ] Fetch task data with `axios.get('/api/groups/{id}/tasks/{task_id}/')`
  - [ ] Display title, description, status, due date, assigned to, created by
  - [ ] Add edit mode to update task fields
  - [ ] Handle update with `axios.put('/api/groups/{id}/tasks/{task_id}/')`
  - [ ] Add delete button (creator/owner only)

- [ ] **Status Update Component**
  - [ ] Create quick status update buttons on task cards
  - [ ] Handle status change with `axios.patch('/api/groups/{id}/tasks/{task_id}/status/')`
  - [ ] Update UI optimistically (change before server confirms)

- [ ] **Task Card Component**
  - [ ] Create reusable `TaskCard.js` component for displaying task summary
  - [ ] Show title, due date, assigned user, status
  - [ ] Add drag-and-drop functionality (optional, nice-to-have)

### Code Example

```javascript
// src/pages/TaskBoard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function TaskBoard() {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState({ todo: [], doing: [], done: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8000/api/groups/${groupId}/tasks/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Group tasks by status
        const grouped = { todo: [], doing: [], done: [] };
        response.data.forEach(task => {
          grouped[task.status].push(task);
        });
        setTasks(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [groupId]);

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="task-board">
      <div className="column">
        <h3>To-Do</h3>
        {tasks.todo.map(task => (
          <div key={task.id} className="task-card">
            <h4>{task.title}</h4>
            <p>{task.due_date}</p>
            <p>Assigned: {task.assigned_to?.username || 'Unassigned'}</p>
          </div>
        ))}
      </div>
      
      <div className="column">
        <h3>Doing</h3>
        {tasks.doing.map(task => (
          <div key={task.id} className="task-card">
            <h4>{task.title}</h4>
            <p>{task.due_date}</p>
            <p>Assigned: {task.assigned_to?.username || 'Unassigned'}</p>
          </div>
        ))}
      </div>
      
      <div className="column">
        <h3>Done</h3>
        {tasks.done.map(task => (
          <div key={task.id} className="task-card">
            <h4>{task.title}</h4>
            <p>{task.due_date}</p>
            <p>Assigned: {task.assigned_to?.username || 'Unassigned'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoard;
```

### Deliverables by End of Week 9
- [ ] Task board with Kanban columns working
- [ ] Create task form functional
- [ ] Task details/edit page complete
- [ ] Status update buttons working
- [ ] Filtering and sorting functional
- [ ] Delete task functionality (with permission checks)

---

## Weeks 10–11: Deployment & Final Testing (Mar 17–Apr 1)

### Prerequisites
- All features tested and documented

### Your Tasks
1. **Prepare for Deployment**
   - [ ] Update `requirements.txt`
   - [ ] Test with production database

2. **Deploy with Team A**
   - [ ] Push to `main` branch
   - [ ] Render auto-deploys
   - [ ] Test on live site

3. **Final Testing**
   - [ ] Verify all endpoints working on Render
   - [ ] Test with Team E's React
   - [ ] Check error handling

### Deliverables by April 1
- [ ] Tasks fully deployed
- [ ] All endpoints tested live
- [ ] Documentation complete
- [ ] No outstanding bugs

---

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/groups/{id}/tasks/` | GET | Yes | List group tasks |
| `/api/groups/{id}/tasks/` | POST | Yes | Create task |
| `/api/groups/{id}/tasks/{id}/` | GET | Yes | Get task details |
| `/api/groups/{id}/tasks/{id}/` | PUT | Yes | Update task |
| `/api/groups/{id}/tasks/{id}/` | DELETE | Yes | Delete task |
| `/api/groups/{id}/tasks/{id}/status/` | PATCH | Yes | Update status |

---

## Key Decisions

- **Status choices:** `todo`, `doing`, `done` (simple Kanban)
- **Assignment:** Optional (task can exist without assignee)
- **Due dates:** Optional
- **Permissions:** Creator/assignee/owner can modify

---

## Blockers & How to Unblock

| Blocker | Solution |
|---------|----------|
| Confused about Group relationship | Ask Team B or review their code |
| Team A auth not ready | Use hardcoded test users |
| Permission checks complex | Start simple, iterate |
| Datetime handling issues | Use Django's DateTimeField, test thoroughly |

---

## Notes

- **Start in week 2** with mock Team B groups
- **Test permission logic** — this is critical
- **Document status workflow** clearly for Team E
- **Ask questions early** — don't wait for integration week!
