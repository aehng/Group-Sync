from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    # This makes the group and author names visible instead of just IDs
    group_name = serializers.ReadOnlyField(source='group.name')
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Meeting
        fields = [
            'id', 'group', 'group_name', 'title', 'description', 
            'location', 'start_time', 'end_time', 'author_username'
        ]