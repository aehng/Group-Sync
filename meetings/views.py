from rest_framework import generics, permissions, serializers
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Meeting, Group
from .serializers import MeetingSerializer

class MeetingListCreateView(generics.ListCreateAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        # Use get_object_or_404 so the API returns a clean 404 if the group doesn't exist
        group = get_object_or_404(Group, id=group_id)
        
        # Requirement: Only group members can view
        if self.request.user not in group.members.all():
            return Meeting.objects.none()

        # Requirement: Sorted by start_time
        queryset = Meeting.objects.filter(group_id=group_id).order_by('start_time')
        
        # Requirement: Filter by upcoming/past
        upcoming = self.request.query_params.get('upcoming')
        past = self.request.query_params.get('past')
        
        if upcoming == 'true':
            queryset = queryset.filter(start_time__gte=timezone.now())
        elif past == 'true': # Use elif for exclusive filtering
            queryset = queryset.filter(start_time__lt=timezone.now())
            
        return queryset

    def perform_create(self, serializer):
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, id=group_id)
        
        # Requirement: Only group members can create
        if self.request.user not in group.members.all():
            raise serializers.ValidationError("Only group members can create meetings.")
        
        # Requirement: Auto-set author/group
        serializer.save(author=self.request.user, group=group)

class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'meeting_id'

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        # Double check membership even for single meeting retrieval
        return Meeting.objects.filter(group_id=group_id, group__members=self.request.user)

    def perform_update(self, serializer):
        # Requirement: Only creator can update
        if self.get_object().author != self.request.user:
            raise serializers.ValidationError("You can only edit meetings you created.")
        serializer.save()

    def perform_destroy(self, instance):
        # Requirement: Only creator can delete
        if instance.author != self.request.user:
            raise serializers.ValidationError("You can only delete meetings you created.")
        instance.delete()