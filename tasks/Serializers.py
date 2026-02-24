from rest_framework import serializers
from .models import Task
from users.models import User


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    assigned_to_details = serializers.SerializerMethodField()
    created_by_details = serializers.SerializerMethodField()
    group_details = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_username',
            'group', 'group_name', 'created_by', 'created_by_username',
            'assigned_to_details', 'created_by_details', 'group_details',
            'status', 'priority', 'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
        extra_kwargs = {
            'group': {'required': False},
        }

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def get_assigned_to_details(self, obj):
        if not obj.assigned_to:
            return None
        return {
            'id': obj.assigned_to.id,
            'username': obj.assigned_to.username,
            'email': obj.assigned_to.email,
        }

    def get_created_by_details(self, obj):
        return {
            'id': obj.created_by.id,
            'username': obj.created_by.username,
            'email': obj.created_by.email,
        }

    def get_group_details(self, obj):
        return {
            'id': obj.group.id,
            'name': obj.group.name,
        }
