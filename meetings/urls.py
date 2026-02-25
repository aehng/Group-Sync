from django.urls import path
from .views import MeetingListCreateView, MeetingDetailView

urlpatterns = [
    # List (GET) and Create (POST)
    path('groups/<int:group_id>/meetings/', MeetingListCreateView.as_view(), name='meeting-list-create'),
    
    # Single Meeting Detail (GET)
    path('groups/<int:group_id>/meetings/<int:meeting_id>/', MeetingDetailView.as_view(), name='meeting-detail'),
]