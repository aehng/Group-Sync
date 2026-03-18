"""API views for messaging.

This module exposes a `MessageViewSet` that lists and creates messages
for a given group. Access is protected to group members only. Cursor
pagination is used to reliably page through messages (newest-first).
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination
from django.shortcuts import get_object_or_404
from groups.models import Group
from .models import Message
from .serializers import MessageSerializer


class MessageCursorPagination(CursorPagination):
    """Cursor pagination for messages so clients can paginate reliably."""
    page_size = 50
    ordering = "-created_at"
    cursor_query_param = "cursor"


class MessageViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for Message CRUD operations.
    
    Endpoints:
    - GET /api/groups/{group_id}/messages/ - List all messages for a group
    - POST /api/groups/{group_id}/messages/ - Create a new message
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessageCursorPagination

    def get_queryset(self):
        """
        Filter messages by group_id from URL parameters.
        Only return messages for the specified group.
        """
        group_id = self.kwargs.get('group_id')
        if group_id:
            # Return newest-first so clients can request the most recent page
            return Message.objects.filter(group_id=group_id).order_by('-created_at')
        return Message.objects.none()

    def list(self, request, *args, **kwargs):
        """
        List messages for a specific group.
        
        Query Parameters:
        - group_id: The ID of the group (required)
        - page_size: Number of messages per page (default: 50, max: 100)
        """
        group_id = self.kwargs.get('group_id')
        
        # Verify the group exists
        group = get_object_or_404(Group, id=group_id)
        
        # Check if user is a member of the group
        if not group.members.filter(user_id=request.user.id).exists():
            return Response(
                {'detail': 'You are not a member of this group.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Create a new message in a specific group.
        
        Request Body:
        {
            "content": "Message text here"
        }
        
        URL Parameter:
        - group_id: The ID of the group
        """
        group_id = self.kwargs.get('group_id')
        
        # Verify the group exists
        group = get_object_or_404(Group, id=group_id)
        
        # Check if user is a member of the group
        if not group.members.filter(user_id=request.user.id).exists():
            return Response(
                {'detail': 'You are not a member of this group.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Add group_id and sender_id to the request data
        data = request.data.copy()
        data["group_id"] = group_id
        data["sender_id"] = request.user.id

        serializer = self.get_serializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def recent(self, request, *args, **kwargs):
        """
        Get the most recent messages for a group.
        
        Query Parameters:
        - count: Number of recent messages to return (default: 10, max: 50)
        """
        group_id = self.kwargs.get('group_id')
        count = int(request.query_params.get('count', 10))
        count = min(count, 50)  # Cap at 50
        
        # Verify the group exists
        group = get_object_or_404(Group, id=group_id)
        
        # Check if user is a member of the group
        if not group.members.filter(user_id=request.user.id).exists():
            return Response(
                {'detail': 'You are not a member of this group.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = Message.objects.filter(group_id=group_id).order_by('-created_at')[:count]
        serializer = self.get_serializer(messages, many=True)
        
        return Response(serializer.data)
