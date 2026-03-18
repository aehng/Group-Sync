from rest_framework import serializers
from django.utils import timezone
from .models import Task
from groups.models import GroupMember


class TaskSerializer(serializers.ModelSerializer):
    STATUS_ALIASES = {
        'pending': 'todo',
        'in_progress': 'doing',
        'completed': 'done',
    }

    status = serializers.CharField(required=False)

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

    def validate_status(self, value):
        normalized_value = self.STATUS_ALIASES.get(value, value)
        valid_statuses = {choice[0] for choice in Task.STATUS_CHOICES}

        if normalized_value not in valid_statuses:
            raise serializers.ValidationError('Invalid task status.')

        return normalized_value

    def validate_due_date(self, value):
        if value and value.tzinfo is None:
            value = timezone.make_aware(value, timezone.get_current_timezone())
        return value

    def validate(self, attrs):
        group = attrs.get('group')
        if not group:
            group = self.context.get('group')
        if not group and self.instance:
            group = self.instance.group

        status_value = attrs.get('status', serializers.empty)
        if status_value is not serializers.empty:
            normalized_status = self.STATUS_ALIASES.get(status_value, status_value)
            valid_statuses = {choice[0] for choice in Task.STATUS_CHOICES}
            if normalized_status not in valid_statuses:
                raise serializers.ValidationError({'status': 'Invalid task status.'})
            attrs['status'] = normalized_status

        assigned_to = attrs.get('assigned_to', serializers.empty)
        if assigned_to is not serializers.empty and assigned_to is not None and group:
            is_member = GroupMember.objects.filter(group=group, user=assigned_to).exists()
            is_owner = group.owner_id == assigned_to.id
            if not (is_member or is_owner):
                raise serializers.ValidationError({
                    'assigned_to': 'Assigned user must be a member of the group.'
                })

        return attrs

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
