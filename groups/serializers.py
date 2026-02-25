from rest_framework import serializers

from .models import Group, GroupMember


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "invite_code", "owner", "created_at", "updated_at"]
        read_only_fields = ["id", "invite_code", "owner", "created_at", "updated_at"]


class GroupMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = GroupMember
        fields = ["id", "user", "role", "joined_at"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
        }


class GroupMemberRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = ["role"]
