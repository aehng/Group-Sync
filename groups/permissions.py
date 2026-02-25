from rest_framework.permissions import BasePermission

from .models import Group, GroupMember


class IsGroupMember(BasePermission):
    message = "You must be a member of this group."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        group_id = view.kwargs.get("group_id") or view.kwargs.get("id")
        if not group_id:
            return False
        return GroupMember.objects.filter(group_id=group_id, user=request.user).exists()


class IsGroupOwner(BasePermission):
    message = "You must be the group owner."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        group_id = view.kwargs.get("group_id") or view.kwargs.get("id")
        if not group_id:
            return False
        return Group.objects.filter(id=group_id, owner=request.user).exists()
