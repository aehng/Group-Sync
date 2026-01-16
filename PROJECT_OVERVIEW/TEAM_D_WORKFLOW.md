# Team D: Meetings Workflow

## Time Log

| Date       | Hours Worked | Description of Work                  |
|------------|--------------|--------------------------------------|
| YYYY-MM-DD | X            | Brief description of tasks completed |

---

**Feature:** Meeting CRUD, datetime scheduling, locations/Zoom links, listing (Backend + Frontend)  
**Estimated Hours:** 30–35  
**Team Size:** 1 person  
**Timeline:** Weeks 1–7 (backend + frontend), Weeks 8–11 (integration & refinement)

---

## Week 1: Setup & Planning (Jan 13–19)

### Prerequisites
- Team A initializes Django project (start before they finish)

### Your Tasks
1. **Set up development environment**
   - [x] Clone/pull Team A's repository
   - [x] Create virtual environment
   - [x] Install dependencies from `requirements.txt`
   - [x] Verify Django runs locally

2. **Git branch setup**
   - [x] Create branches: `develop`, `feature/meetings`
   - [x] Work on `feature/meetings` for all meeting-related features

3. **Understand dependencies**
   - [ ] Review Team A's User model
   - [ ] Review Team B's Group/GroupMember models
   - [ ] Plan how Meeting will reference Group, created_by, etc.

4. **Create `meetings` app**
   - [ ] `python manage.py startapp meetings`
   - [ ] Add to `INSTALLED_APPS` in `settings.py`

5. **Plan Meeting structure**
   - [ ] Sketch fields: title, description, start_time, end_time (optional), location_or_link (Zoom/address), agenda
   - [ ] Decide: is end_time required? (no for MVP)
   - [ ] Decide: notification/reminder system? (defer to week 9)
   - [ ] Share design with teams

### Deliverables by End of Week 1
- [ ] Development environment set up
- [ ] `meetings` app created
- [ ] Meeting model design finalized
- [ ] Ready to start coding

---

## Weeks 2–3: Meeting Model & Serializers (Jan 20–Feb 2)

### Prerequisites
- Django project running
- Team A's User model understood
- Team B's Group model understood

### Your Tasks
1. **Meeting Model**
   - [ ] Fields: `id`, `group` (FK to Group), `title`, `description`, `start_time`, `end_time` (optional), `location_or_link`, `agenda` (optional), `created_by` (FK to User), `created_at`, `updated_at`
   - [ ] Validators: title not empty (max 200 chars), start_time can't be in past (optional check)
   - [ ] Write migration

2. **Serializers**
   - [ ] `MeetingSerializer` for CRUD
   - [ ] Include nested User info for created_by
   - [ ] Include nested Group info
   - [ ] Handle datetime formatting (ISO 8601)

### Code Example

```python
# meetings/models.py
from django.db import models
from django.contrib.auth import get_user_model
from groups.models import Group
from django.utils import timezone

User = get_user_model()

class Meeting(models.Model):
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='meetings')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    location_or_link = models.CharField(max_length=500)  # "Room 101" or "https://zoom.us/..."
    agenda = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_meetings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['start_time']
    
    def is_upcoming(self):
        return self.start_time > timezone.now()
    
    def is_past(self):
        return self.start_time < timezone.now()
```

### Deliverables by End of Week 3
- [ ] Meeting model with migrations
- [ ] Meeting serializers created and tested
- [ ] Datetime handling tested
- [ ] Ready to build endpoints

---

## Weeks 4–5: CRUD Endpoints (Feb 3–16)

### Prerequisites
- Meeting model and serializers complete
- Team A's auth working
- Team B's groups working

### Your Tasks
1. **List Meetings Endpoint**
   - [ ] `GET /api/groups/{group_id}/meetings/`
   - [ ] Return: All meetings in group (sorted by start_time)
   - [ ] Filter by upcoming: `?upcoming=true` (show only future meetings)
   - [ ] Filter by past: `?past=true` (show only past meetings)
   - [ ] Only group members can view

2. **Get Single Meeting Endpoint**
   - [ ] `GET /api/groups/{group_id}/meetings/{meeting_id}/`
   - [ ] Return: Full meeting details
   - [ ] Only group members can view

3. **Create Meeting Endpoint**
   - [ ] `POST /api/groups/{group_id}/meetings/`
   - [ ] Accept: `title`, `description` (optional), `start_time`, `end_time` (optional), `location_or_link`, `agenda` (optional)
   - [ ] Auto-set `created_by` to authenticated user
   - [ ] Validate start_time is valid datetime
   - [ ] Only group members can create

4. **Update Meeting Endpoint**
   - [ ] `PUT /api/groups/{group_id}/meetings/{meeting_id}/`
   - [ ] Accept: any field (optional)
   - [ ] Only creator or group owner can update
   - [ ] Return: Updated meeting

5. **Delete Meeting Endpoint**
   - [ ] `DELETE /api/groups/{group_id}/meetings/{meeting_id}/`
   - [ ] Only creator or group owner can delete
   - [ ] Return: 204 No Content

### Code Example

```python
# meetings/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from groups.models import Group, GroupMember
from .models import Meeting
from .serializers import MeetingSerializer

class MeetingListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        meetings = Meeting.objects.filter(group=group)
        
        # Filter by upcoming/past
        upcoming = request.query_params.get('upcoming')
        past = request.query_params.get('past')
        
        if upcoming == 'true':
            meetings = meetings.filter(start_time__gte=timezone.now())
        elif past == 'true':
            meetings = meetings.filter(start_time__lt=timezone.now())
        
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data)
    
    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MeetingSerializer(data=request.data)
        if serializer.is_valid():
            meeting = serializer.save(group=group, created_by=request.user)
            return Response(MeetingSerializer(meeting).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeetingDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id, meeting_id):
        try:
            group = Group.objects.get(id=group_id)
            meeting = Meeting.objects.get(id=meeting_id, group=group)
        except (Group.DoesNotExist, Meeting.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data)
    
    def put(self, request, group_id, meeting_id):
        try:
            group = Group.objects.get(id=group_id)
            meeting = Meeting.objects.get(id=meeting_id, group=group)
        except (Group.DoesNotExist, Meeting.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission
        if meeting.created_by != request.user and group.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MeetingSerializer(meeting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, group_id, meeting_id):
        try:
            group = Group.objects.get(id=group_id)
            meeting = Meeting.objects.get(id=meeting_id, group=group)
        except (Group.DoesNotExist, Meeting.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if meeting.created_by != request.user and group.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### Deliverables by End of Week 5
- [ ] List meetings endpoint working
- [ ] Get single meeting endpoint working
- [ ] Create meeting endpoint working
- [ ] Update meeting endpoint working
- [ ] Delete meeting endpoint working
- [ ] All endpoints tested with Postman/curl
- [ ] Datetime filtering working

---

## Weeks 6–7: Testing & Integration (Feb 17–Mar 2)

### Prerequisites
- All CRUD endpoints working
- Team A & B fully integrated

### Your Tasks
1. **Permission Verification**
   - [ ] Only group members can view/create meetings
   - [ ] Only creator/owner can update/delete
   - [ ] Test all edge cases

2. **Datetime Edge Cases**
   - [ ] Test filtering by upcoming/past
   - [ ] Test timezone handling
   - [ ] Test invalid datetime inputs
   - [ ] Test end_time before start_time validation

3. **Unit Tests**
   - [ ] Test meeting creation
   - [ ] Test filtering (upcoming/past)
   - [ ] Test permission enforcement
   - [ ] Test datetime validation
   - [ ] Aim for 80%+ coverage

4. **Integration Testing**
   - [ ] Verify Meeting endpoints work with Group structure
   - [ ] Test Team E's ability to query meetings
   - [ ] Test calendar display in React

### Test Example

```python
# meetings/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from groups.models import Group, GroupMember
from .models import Meeting

User = get_user_model()

class MeetingTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.group = Group.objects.create(name='Test Group', owner=self.user1)
        GroupMember.objects.create(group=self.group, user=self.user1, role='owner')
        GroupMember.objects.create(group=self.group, user=self.user2, role='member')
    
    def test_create_meeting(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/groups/{self.group.id}/meetings/', {
            'title': 'Team Sync',
            'start_time': timezone.now() + timedelta(hours=1),
            'location_or_link': 'https://zoom.us/...'
        })
        self.assertEqual(response.status_code, 201)
    
    def test_filter_upcoming(self):
        self.client.force_authenticate(user=self.user1)
        Meeting.objects.create(
            group=self.group,
            title='Future Meeting',
            start_time=timezone.now() + timedelta(days=1),
            location_or_link='Room 101',
            created_by=self.user1
        )
        response = self.client.get(f'/api/groups/{self.group.id}/meetings/?upcoming=true')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
```

### Deliverables by End of Week 7
- [ ] Unit tests written and passing
- [ ] Permission system tested
- [ ] Datetime handling tested thoroughly
- [ ] Integration testing complete
- [ ] All bugs fixed

---

## Weeks 8–9: React Frontend Development (Mar 3–16)

### Prerequisites
- Backend meeting endpoints complete and tested
- Group context available from Team B
- React project set up (coordinate with Team E for shared components)

### Your Tasks
- [ ] **Meeting List Page**
  - [ ] Create `MeetingList.js` component to display all meetings
  - [ ] Fetch meetings with `axios.get('/api/groups/{id}/meetings/')` with JWT token
  - [ ] Display meetings in list or calendar view
  - [ ] Add filters for upcoming vs. past meetings
  - [ ] Add button to create new meeting

- [ ] **Create Meeting Form**
  - [ ] Create `CreateMeeting.js` component with fields: title, description, start_time, end_time (optional), location_or_link, agenda
  - [ ] Use datetime input for start_time and end_time
  - [ ] Handle form submission with `axios.post('/api/groups/{id}/meetings/')`
  - [ ] Display validation errors

- [ ] **Meeting Details/Edit Page**
  - [ ] Create `MeetingDetails.js` component to display full meeting info
  - [ ] Fetch meeting data with `axios.get('/api/groups/{id}/meetings/{meeting_id}/')`
  - [ ] Display title, description, start/end time, location/Zoom link, agenda, creator
  - [ ] Add edit mode to update meeting fields
  - [ ] Handle update with `axios.put('/api/groups/{id}/meetings/{meeting_id}/')`
  - [ ] Add delete button (creator/owner only)

- [ ] **Calendar View Component (Optional)**
  - [ ] Create `Calendar.js` component using a library like `react-calendar` or build simple month view
  - [ ] Display meetings on their scheduled dates
  - [ ] Click date to see all meetings on that day
  - [ ] Highlight today and upcoming meetings

- [ ] **Meeting Card Component**
  - [ ] Create reusable `MeetingCard.js` component for displaying meeting summary
  - [ ] Show title, start time, location, and creator
  - [ ] Add "Join" button for Zoom links

### Code Example

```javascript
// src/pages/MeetingList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function MeetingList() {
  const { groupId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = `http://localhost:8000/api/groups/${groupId}/meetings/`;
        
        if (filter === 'upcoming') {
          url += '?upcoming=true';
        } else if (filter === 'past') {
          url += '?past=true';
        }
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMeetings(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [groupId, filter]);

  if (loading) return <p>Loading meetings...</p>;

  return (
    <div>
      <h2>Meetings</h2>
      <Link to={`/groups/${groupId}/meetings/create`}>Schedule Meeting</Link>
      
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('upcoming')}>Upcoming</button>
        <button onClick={() => setFilter('past')}>Past</button>
      </div>
      
      {meetings.map(meeting => (
        <div key={meeting.id} className="meeting-card">
          <Link to={`/groups/${groupId}/meetings/${meeting.id}`}>
            <h3>{meeting.title}</h3>
          </Link>
          <p>{new Date(meeting.start_time).toLocaleString()}</p>
          <p>{meeting.location_or_link}</p>
          <p>By: {meeting.created_by.username}</p>
          {meeting.location_or_link.startsWith('http') && (
            <a href={meeting.location_or_link} target="_blank" rel="noopener noreferrer">
              Join Meeting
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default MeetingList;
```

### Deliverables by End of Week 9
- [ ] Meeting list page with filtering
- [ ] Create meeting form functional
- [ ] Meeting details/edit page complete
- [ ] Calendar view (optional)
- [ ] Delete meeting functionality (with permission checks)
- [ ] Join meeting links working

---

## Weeks 10–11: Deployment & Final Testing (Mar 17–Apr 1)

### Prerequisites
- All features tested and documented

### Your Tasks
1. **Prepare for Deployment**
   - [ ] Update `requirements.txt`
   - [ ] Ensure datetime handling works in production timezone

2. **Deploy with Team A**
   - [ ] Push to `main` branch
   - [ ] Render auto-deploys
   - [ ] Test on live site

3. **Final Testing**
   - [ ] Verify all endpoints working on Render
   - [ ] Test datetime/timezone on live site
   - [ ] Test with Team E's React calendar

### Deliverables by April 1
- [ ] Meetings fully deployed
- [ ] All endpoints tested live
- [ ] Timezone handling verified
- [ ] Documentation complete

---

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/groups/{id}/meetings/` | GET | Yes | List group meetings |
| `/api/groups/{id}/meetings/` | POST | Yes | Create meeting |
| `/api/groups/{id}/meetings/{id}/` | GET | Yes | Get meeting details |
| `/api/groups/{id}/meetings/{id}/` | PUT | Yes | Update meeting |
| `/api/groups/{id}/meetings/{id}/` | DELETE | Yes | Delete meeting |

---

## Key Decisions

- **DateTime format:** ISO 8601 (Django default)
- **Location:** Single string field (supports "Room 101" or "https://zoom.us/...")
- **End time:** Optional (for more flexible scheduling)
- **Filtering:** Upcoming/past by start_time

---

## Datetime Tips

- Always use Django's `timezone.now()` (timezone-aware)
- Never use `datetime.now()` (naive)
- In serializers, use `DateTimeField()` (auto-formats as ISO 8601)
- Use `timezone.make_aware()` if converting naive datetimes

```python
from django.utils import timezone
from datetime import timedelta

# Do this:
future_time = timezone.now() + timedelta(hours=1)

# Not this:
from datetime import datetime
future_time = datetime.now() + timedelta(hours=1)  # Wrong!
```

---

## Blockers & How to Unblock

| Blocker | Solution |
|---------|----------|
| Confused about Group relationship | Ask Team B or review their code |
| Datetime issues | Test with timezone.now(), use DateTimeField in models |
| Team A auth not ready | Use hardcoded test users for now |
| Permission checks complex | Start simple, add complexity iteratively |

---

## Notes

- **Start in week 2** with mock Team B groups
- **Test datetime thoroughly** — timezones cause subtle bugs
- **Document location format** clearly (supports Zoom links, room numbers, etc.)
- **Ask questions early** — don't wait for integration week!
