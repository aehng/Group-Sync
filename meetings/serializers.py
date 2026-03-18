from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    # These help display names instead of just IDs in the frontend
    group_name = serializers.ReadOnlyField(source='group.name')
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Meeting
        fields = [
            'id', 
            'group', 
            'group_name', 
            'title', 
            'description', 
            'location_or_link', # Match your model field name
            'start_time', 
            'end_time', 
            'agenda',           # Added this for your task list
            'author',           # MUST be in fields to save correctly
            'author_username'
        ]
        # CRITICAL: Prevent the frontend from sending these
        read_only_fields = ['author', 'group']