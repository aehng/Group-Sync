from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    group_name = serializers.ReadOnlyField(source='group.name')
    author_username = serializers.ReadOnlyField(source='author.username')
    creator = serializers.ReadOnlyField(source='author.id')
    creator_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Meeting
        fields = [
            'id', 
            'group', 
            'group_name', 
            'title', 
            'description', 
            'location_or_link',
            'start_time', 
            'end_time', 
            'agenda',
            'author',
            'author_username',
            'creator',
            'creator_name',
        ]
        read_only_fields = ['author', 'group', 'group_name', 'author_username', 'creator', 'creator_name']