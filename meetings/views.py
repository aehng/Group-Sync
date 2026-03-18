from rest_framework import generics, permissions, serializers
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.shortcuts import get_object_or_404
from groups.models import GroupMember, Group
from .models import Meeting
from .serializers import MeetingSerializer

class MeetingListCreateView(generics.ListCreateAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, id=group_id)

        if not GroupMember.objects.filter(group=group, user=self.request.user).exists():
            raise PermissionDenied("You must be a member of this group.")

        # Requirement: Sorted by start_time
        queryset = Meeting.objects.filter(group_id=group_id).order_by('start_time')
        
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

        if not GroupMember.objects.filter(group=group, user=self.request.user).exists():
            raise PermissionDenied("Only group members can create meetings.")

        serializer.save(author=self.request.user, group=group)

class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'meeting_id'

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, id=group_id)
        if not GroupMember.objects.filter(group=group, user=self.request.user).exists():
            raise PermissionDenied("You must be a member of this group.")
        return Meeting.objects.filter(group_id=group_id)

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