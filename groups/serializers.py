from rest_framework import serializers

from .models import Group, GroupMember


class GroupSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "invite_code", "owner", "member_count", "created_at", "updated_at"]
        read_only_fields = ["id", "invite_code", "owner", "member_count", "created_at", "updated_at"]

    def get_owner(self, obj):
        if not obj.owner:
            return None
        return {"id": obj.owner.id, "username": getattr(obj.owner, "username", None), "email": getattr(obj.owner, "email", None)}

    def get_member_count(self, obj):
        # Use related_name 'members' on GroupMember
        return obj.members.count()


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
