from rest_framework.permissions import BasePermission
from .models import Group, GroupMember


class IsGroupOwner(BasePermission):
    """
    Permission to check if the user is the owner of the group.
    """
    message = "Only the group owner can perform this action."
    
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsGroupMember(BasePermission):
    """
    Permission to check if the user is a member of the group.
    """
    message = "You are not a member of this group."
    
    def has_object_permission(self, request, view, obj):
        return GroupMember.objects.filter(group=obj, user=request.user).exists()
