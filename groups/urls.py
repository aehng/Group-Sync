from django.urls import path
from .views import (
    GroupListCreateView,
    GroupDetailView,
    JoinGroupView,
    GroupMembersView,
)

app_name = 'groups'

urlpatterns = [
    # Group CRUD endpoints
    path('', GroupListCreateView.as_view(), name='group-list-create'),
    path('<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('<int:pk>/members/', GroupMembersView.as_view(), name='group-members'),
    
    # Join group by invite code
    path('join/', JoinGroupView.as_view(), name='join-group'),
]
