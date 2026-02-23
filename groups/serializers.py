from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, GroupMember

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (lightweight)."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class GroupMemberSerializer(serializers.ModelSerializer):
    """Serializer for GroupMember model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = GroupMember
        fields = ['id', 'user', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group model with nested members."""
    owner = UserSerializer(read_only=True)
    members = GroupMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'invite_code', 'members', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'invite_code', 'members', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        """Return the count of members in the group."""
        return obj.members.count()


class GroupDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Group model."""
    owner = UserSerializer(read_only=True)
    members = GroupMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'invite_code', 'members', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'invite_code', 'members', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        """Return the count of members in the group."""
        return obj.members.count()


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new group."""
    class Meta:
        model = Group
        fields = ['name']


class InviteCodeSerializer(serializers.Serializer):
    """Serializer for joining a group by invite code."""
    invite_code = serializers.CharField(max_length=8, required=True)
