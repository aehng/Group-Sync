from rest_framework import generics, permissions, serializers
from django.utils import timezone
from .models import Meeting, Group
from .serializers import MeetingSerializer

class MeetingListCreateView(generics.ListCreateAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        group = Group.objects.get(id=group_id)
        if self.request.user not in group.members.all():
            return Meeting.objects.none()

        queryset = Meeting.objects.filter(group_id=group_id).order_by('start_time')
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            queryset = queryset.filter(start_time__gte=timezone.now())
        past = self.request.query_params.get('past')
        if past == 'true':
            queryset = queryset.filter(start_time__lt=timezone.now())
        return queryset

    def perform_create(self, serializer):
        group_id = self.kwargs['group_id']
        group = Group.objects.get(id=group_id)
        if self.request.user not in group.members.all():
            raise serializers.ValidationError("Only group members can create meetings.")
        serializer.save(author=self.request.user, group=group)

# UPGRADED: Now handles Update and Delete
class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'meeting_id'

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        group = Group.objects.get(id=group_id)
        if self.request.user not in group.members.all():
            return Meeting.objects.none()
        return Meeting.objects.filter(group_id=group_id)

    def perform_update(self, serializer):
        # Optional: Only let the author edit
        if self.get_object().author != self.request.user:
            raise serializers.ValidationError("You can only edit meetings you created.")
        serializer.save()

    def perform_destroy(self, instance):
        # Optional: Only let the author delete
        if instance.author != self.request.user:
            raise serializers.ValidationError("You can only delete meetings you created.")
        instance.delete()