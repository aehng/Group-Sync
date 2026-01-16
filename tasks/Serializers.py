from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'group', 'title', 'description', 'status', 
            'due_date', 'assigned_to', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_assigned_to(self, obj):
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'username': obj.assigned_to.username,
                'email': obj.assigned_to.email
            }
        return None
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'username': obj.created_by.username,
            'email': obj.created_by.email
        }
    
    def get_group(self, obj):
        return {
            'id': obj.group.id,
            'name': obj.group.name
        }
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['status'] = 'todo'  # Default status
        return super().create(validated_data) 