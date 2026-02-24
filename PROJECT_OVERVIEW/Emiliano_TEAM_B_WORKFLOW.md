## Time Log

| Date       | Hours Worked | Description of Work                  |
|------------|--------------|--------------------------------------|
| YYYY-MM-DD | X            | Brief description of tasks completed |

---

# Team B: Groups & Members Workflow

**Feature:** Group creation, invite codes, group membership, owner/member roles (Backend + Frontend)  
**Estimated Hours:** 30–35  
**Team Size:** 1 person  
**Timeline:** Weeks 1–7 (backend + frontend), Weeks 8–11 (integration & refinement)

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- Team A initializes Django project (you'll start on this before they're done)

### Your Tasks
1. **Set up development environment**
   - [X] Clone/pull Team A's repository
   - [X] Create virtual environment
   - [X] Install dependencies from `requirements.txt`
   - [X] Verify Django runs locally

2. **Git branch setup**
   - [X] Create branches: `develop`, `feature/groups`
   - [X] Work on `feature/groups` for all group-related features

3. **Understand auth endpoints**
   - [X] Review Team A's API contract for registration/login
   - [X] Know that you'll use their JWT tokens to authenticate
   - [ ] Plan how GroupMember will reference User model

4. **Create `groups` app**
   - [X] `python manage.py startapp groups`
   - [X] Add to `INSTALLED_APPS` in `settings.py`

5. **Plan database relationships**
   - [ ] Sketch out Group ↔ User relationship
   - [ ] Plan how to enforce Owner vs Member roles
   - [ ] Decide: should Owner be a GroupMember or separate field?
   - [ ] Share design with Team A for feedback

### Deliverables by End of Week 1
- [X] Development environment set up
- [X] `groups` app created
- [ ] Database relationship design finalized
- [ ] Ready to start coding

---

## Weeks 2–3: Core Models & Invite System (Jan 20–Feb 2)

### Prerequisites
- Django project running
- Understand User model structure (from Team A)

### Your Tasks
1. **Group Model**
   - [X] Create Group model with fields: `id`, `name`, `owner` (FK to User), `created_at`, `updated_at`
   - [X] Add validators (group name not empty, max 100 chars)
   - [X] Write migration

2. **GroupMember Model**
   - [X] Create GroupMember model: `id`, `group` (FK), `user` (FK), `role` (owner|member), `joined_at`
   - [X] Add constraint: prevent duplicate user+group combinations
   - [X] Make `role` choices: `owner`, `member`
   - [X] Write migration

3. **Invite Code Generation**
   - [ ] Add `invite_code` field to Group (unique, random string)
   - [ ] Generate 6-8 char alphanumeric code on group creation
   - [ ] Example: `GROUP123ABC`
   - [ ] Write helper function to generate codes

4. **Initial Serializers**
   - [ ] `GroupSerializer` for read/write
   - [ ] `GroupMemberSerializer` for membership data
   - [ ] `InviteCodeSerializer` for validating invites

### Code Example

```python
# groups/models.py
from django.db import models
from django.contrib.auth import get_user_model
import uuid, secrets

User = get_user_model()

class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_groups')
    invite_code = models.CharField(max_length=8, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = self.generate_invite_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_invite_code():
        return secrets.token_hex(4).upper()[:8]

class GroupMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('member', 'Member'),
    ]
    
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('group', 'user')
    
    def __str__(self):
        return f"{self.user.username} in {self.group.name}"
```

### Deliverables by End of Week 3
- [ ] Group model with migrations
- [ ] GroupMember model with migrations
- [ ] Invite code generation working
- [ ] Serializers created and tested

---

## Weeks 4–5: CRUD Endpoints (Feb 3–16)

### Prerequisites
- Models and serializers complete
- Team A's auth endpoints working (you'll use JWT)

### Your Tasks
1. **Group Creation Endpoint**
   - [ ] `POST /api/groups/`
   - [ ] Accept: `name` (required)
   - [ ] Auto-set owner to authenticated user
   - [ ] Auto-generate invite code
   - [ ] Auto-create GroupMember (owner) for creator
   - [ ] Return: Group data + invite code

2. **List Groups Endpoint**
   - [ ] `GET /api/groups/`
   - [ ] Return: All groups user belongs to (via GroupMember)
   - [ ] Include member count and owner name
   - [ ] Filter by user's memberships

3. **Get Group Details Endpoint**
   - [ ] `GET /api/groups/{id}/`
   - [ ] Return: Group info + all members + owner info
   - [ ] Accessible only to group members

4. **Update Group Endpoint**
   - [ ] `PUT /api/groups/{id}/`
   - [ ] Accept: `name` (optional)
   - [ ] Restricted: Owner only
   - [ ] Return: Updated group data

5. **Delete Group Endpoint**
   - [ ] `DELETE /api/groups/{id}/`
   - [ ] Restricted: Owner only
   - [ ] Delete cascades to all GroupMembers

6. **Join Group by Invite Code Endpoint**
   - [ ] `POST /api/groups/join/`
   - [ ] Accept: `invite_code`
   - [ ] Validate code exists
   - [ ] Create GroupMember (role='member') for authenticated user
   - [ ] Return: Group data

### Code Example

```python
# groups/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Group, GroupMember
from .serializers import GroupSerializer

class GroupListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get all groups the user belongs to
        groups = Group.objects.filter(members__user=request.user)
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save(owner=request.user)
            # Auto-add owner as member
            GroupMember.objects.create(group=group, user=request.user, role='owner')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JoinGroupView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        invite_code = request.data.get('invite_code')
        try:
            group = Group.objects.get(invite_code=invite_code)
        except Group.DoesNotExist:
            return Response({'error': 'Invalid invite code'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already member
        if GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add as member
        GroupMember.objects.create(group=group, user=request.user, role='member')
        serializer = GroupSerializer(group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### Deliverables by End of Week 5
- [ ] Group creation endpoint working
- [ ] List groups endpoint working
- [ ] Get group details endpoint working
- [ ] Update group endpoint (owner only)
- [ ] Delete group endpoint (owner only)
- [ ] Join group by invite code working
- [ ] All endpoints tested with Postman/curl

---

## Weeks 6–7: Permissions & Integration (Feb 17–Mar 2)

### Prerequisites
- All CRUD endpoints working
- Team A's auth fully integrated

### Your Tasks
1. **Permission Classes**
   - [ ] Create `IsGroupOwner` permission (only owner can edit/delete)
   - [ ] Create `IsGroupMember` permission (only members can access group details)
   - [ ] Apply to all relevant endpoints

2. **Get Group Members Endpoint**
   - [ ] `GET /api/groups/{id}/members/`
   - [ ] Return: List of all members with roles
   - [ ] Include: username, email, role, joined_at

3. **Update Member Role Endpoint** (Nice-to-Have)
   - [ ] `PUT /api/groups/{id}/members/{user_id}/`
   - [ ] Accept: `role` (owner|member)
   - [ ] Restricted: Owner only
   - [ ] Return: Updated member data
   - [ ] (Can defer to week 8 if time is tight)

4. **Unit Tests**
   - [ ] Test group creation
   - [ ] Test join group via invite code
   - [ ] Test permission enforcement (non-owner can't delete)
   - [ ] Test GroupMember creation
   - [ ] Aim for 80%+ coverage

5. **Integration with Team C & D**
   - [ ] Verify Task/Meeting endpoints can reference Group correctly
   - [ ] Help with any Group relationship questions
   - [ ] Test their ability to filter tasks/meetings by group

### Test Example

```python
# groups/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Group, GroupMember

User = get_user_model()

class GroupTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.client.force_authenticate(user=self.user1)
    
    def test_create_group(self):
        response = self.client.post('/api/groups/', {'name': 'Test Group'})
        self.assertEqual(response.status_code, 201)
        self.assertIn('invite_code', response.data)
    
    def test_join_group(self):
        group = Group.objects.create(name='Test', owner=self.user1)
        self.client.force_authenticate(user=self.user2)
        response = self.client.post('/api/groups/join/', {'invite_code': group.invite_code})
        self.assertEqual(response.status_code, 201)
```

### Deliverables by End of Week 7
- [ ] Permission classes implemented
- [ ] List members endpoint working
- [ ] All endpoints secured with proper permissions
- [ ] Unit tests written and passing
- [ ] Tested with Teams C & D

---

## Weeks 8–9: React Frontend Development (Mar 3–16)

### Prerequisites
- Backend group endpoints complete and tested
- Auth context available from Team A
- React project set up (coordinate with Team E for shared components)

### Your Tasks
- [ ] **Group List/Dashboard Page**
  - [ ] Create `GroupList.js` component to display all user's groups
  - [ ] Fetch groups with `axios.get('/api/groups/')` with JWT token
  - [ ] Display group name, owner, and member count
  - [ ] Add button to navigate to group details

- [ ] **Create Group Form**
  - [ ] Create `CreateGroup.js` component with group name field
  - [ ] Handle form submission with `axios.post('/api/groups/')`
  - [ ] Redirect to group details on success
  - [ ] Display validation errors

- [ ] **Join Group Form**
  - [ ] Create `JoinGroup.js` component with invite code field
  - [ ] Handle form submission with `axios.post('/api/groups/join/')`
  - [ ] Redirect to group details on success
  - [ ] Display error for invalid codes

- [ ] **Group Details Page**
  - [ ] Create `GroupDetails.js` component to display group info
  - [ ] Fetch group data with `axios.get('/api/groups/{id}/')`
  - [ ] Display group name, invite code, owner, and member list
  - [ ] Add "Copy invite code" button
  - [ ] Show edit/delete buttons (owner only)

- [ ] **Members List Component**
  - [ ] Create `MembersList.js` to display all group members
  - [ ] Fetch members with `axios.get('/api/groups/{id}/members/')`
  - [ ] Display username, role, and joined date
  - [ ] Highlight the owner

### Code Example

```javascript
// src/pages/GroupList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/groups/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Groups</h2>
      <Link to="/groups/create">Create New Group</Link>
      <Link to="/groups/join">Join Group</Link>
      {groups.map(group => (
        <div key={group.id}>
          <Link to={`/groups/${group.id}`}>
            <h3>{group.name}</h3>
          </Link>
          <p>Owner: {group.owner.username}</p>
          <p>Members: {group.member_count}</p>
        </div>
      ))}
    </div>
  );
}

export default GroupList;
```

### Deliverables by End of Week 9
- [ ] Group list page complete
- [ ] Create group form working
- [ ] Join group form working
- [ ] Group details page with members list
- [ ] Copy invite code functionality
- [ ] Edit/delete buttons (owner only)

---

## Weeks 10–11: Deployment & Final Testing (Mar 17–Apr 1)

### Prerequisites
- All features tested and documented

### Your Tasks
1. **Prepare for Deployment**
   - [ ] Update `requirements.txt`
   - [ ] Ensure models work with production database

2. **Deploy with Team A**
   - [ ] Push to `main` branch
   - [ ] Render auto-deploys
   - [ ] Test group creation/join on live site

3. **Final Testing**
   - [ ] Verify all endpoints working on Render
   - [ ] Test with Team E's React frontend
   - [ ] Check error handling

### Deliverables by April 1
- [ ] Groups fully deployed
- [ ] All endpoints tested live
- [ ] Documentation complete
- [ ] No outstanding bugs

---

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/groups/` | GET | Yes | List user's groups |
| `/api/groups/` | POST | Yes | Create new group |
| `/api/groups/{id}/` | GET | Yes | Get group details |
| `/api/groups/{id}/` | PUT | Yes | Update group (owner only) |
| `/api/groups/{id}/` | DELETE | Yes | Delete group (owner only) |
| `/api/groups/join/` | POST | Yes | Join group by invite code |
| `/api/groups/{id}/members/` | GET | Yes | List group members |

---

## Dependencies (same as Team A)

```
Django==4.2
djangorestframework==3.14
djangorestframework-simplejwt==5.2
psycopg2-binary==2.9
drf-spectacular==0.26
```

---

## Key Decisions

- **Invite codes:** Random 8-char strings, regenerate if needed
- **Roles:** Only 'owner' and 'member' for MVP (can expand later)
- **Deletion:** Owner can delete group (cascades to all members)
- **Member join:** Via invite code only (no auto-discovery)

---

## Blockers & How to Unblock

| Blocker | Solution |
|---------|----------|
| Not sure about ForeignKey relationships | Ask Team A or Django docs |
| Team A's auth not ready | Use hardcoded test users for now |
| Permission checks failing | Review `permission_classes` in views |
| Unique constraint violations | Check GroupMember.Meta.unique_together |

---

## Notes

- **Start immediately in week 2** with mock auth from Team A
- **Test your permission system thoroughly** — this is critical
- **Document invite code generation** so it's clear to others
- **Ask questions early** — don't wait until integration week!
