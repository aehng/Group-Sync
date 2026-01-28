from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet

# Create a router for the MessageViewSet
router = DefaultRouter()

# The router will handle the viewset with dynamic routing
# We'll register it with a custom basename to handle nested routing

urlpatterns = [
    # Nested route: /api/groups/<group_id>/messages/
    path(
        'groups/<int:group_id>/messages/',
        MessageViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='message-list'
    ),
    # Nested route for recent messages: /api/groups/<group_id>/messages/recent/
    path(
        'groups/<int:group_id>/messages/recent/',
        MessageViewSet.as_view({
            'get': 'recent'
        }),
        name='message-recent'
    ),
]
