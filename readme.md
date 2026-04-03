# GroupSync

A web app designed to help groups coordinate tasks, share updates, and manage projects collaboratively. Designed for college students working on group projects.

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

1. Open a web browser and navigate to `http://localhost:3000` (if running locally) or the deployed URL
2. Create an account or log in with your credentials
3. **Create or Join a Group**: Start by creating a new group or join an existing one using an invite code
4. **Manage Tasks**: Add, assign, and track tasks within your group with status (To Do, Doing, Done) and priority levels
5. **Schedule Meetings**: Create meeting events with titles, descriptions, times, locations/meeting links, and agendas
6. **Collaborate**: Use the messaging feature to communicate with group members in real-time
7. **View Group Dashboard**: Monitor all tasks, upcoming meetings, and recent messages for your groups

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

**System Requirements:**
* Python 3.10+
* Node.js 18+ (for React frontend)

**Backend Dependencies:**
* Django 4.2
* Django REST Framework 3.14
* djangorestframework-simplejwt 5.2 (JWT authentication)
* django-cors-headers 4.3.0 (CORS support)
* python-dotenv 1.0 (environment variable management)
* gunicorn 21.2.0 (production server)
* whitenoise 6.6.0 (static file serving)
* dj-database-url 2.1.0 (database URL parsing)

**Frontend Dependencies:**
* React 19.2.3
* React Router DOM 7.12.0 (client-side routing)
* Axios 1.13.2 (HTTP client)
* date-fns 4.1.0 (date utilities)
* Express 4.18.2 (production server)

**To install Node.js on Windows:**
```
winget install OpenJS.NodeJS
```

Then restart your terminal for PATH changes to take effect.


## Useful Websites to Learn More

* [Django Documentation](https://docs.djangoproject.com/en/)
* [React Documentation](https://reactjs.org/docs/getting-started.html)

## Future Work

Potential improvements and features to add in the future:

* [ ] Implement real-time notifications for group updates and task assignments
* [ ] Add file/document sharing within groups
* [ ] Implement recurring meetings (weekly, bi-weekly, monthly)
* [ ] Add task dependencies and milestones
* [ ] Implement user roles and permission management (admin, moderator, member)
* [ ] Add email notifications for important group events
* [ ] Create mobile app versions for iOS and Android
* [ ] Add calendar integration (Google Calendar, Outlook)
* [ ] Implement two-factor authentication for enhanced security
* [ ] Add group analytics and activity reports
* [ ] Support for archived groups and tasks
* [ ] Implement dark mode UI theme
