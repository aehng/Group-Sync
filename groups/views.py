from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Group, GroupMember
from .permissions import IsGroupMember, IsGroupOwner
from .serializers import GroupMemberRoleSerializer, GroupMemberSerializer, GroupSerializer


class GroupCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            group = serializer.save(owner=request.user)
            GroupMember.objects.create(group=group, user=request.user, role="owner")

        return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)


class GroupJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invite_code = request.data.get("invite_code")
        if not invite_code:
            return Response(
                {"detail": "Invite code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        group = get_object_or_404(Group, invite_code=invite_code)
        member, created = GroupMember.objects.get_or_create(
            group=group,
            user=request.user,
            defaults={"role": "member"},
        )

        payload = GroupMemberSerializer(member).data
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(payload, status=status_code)


class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated, IsGroupOwner]

    def delete(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GroupMembersListView(APIView):
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        members = GroupMember.objects.filter(group=group).select_related("user")
        serializer = GroupMemberSerializer(members, many=True)
        return Response(serializer.data)


class GroupMemberRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsGroupOwner]

    def put(self, request, group_id, user_id):
        group = get_object_or_404(Group, id=group_id)
        member = get_object_or_404(GroupMember, group=group, user_id=user_id)
        serializer = GroupMemberRoleSerializer(member, data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_role = serializer.validated_data["role"]
        if member.user_id == group.owner_id and new_role != "owner":
            return Response(
                {"detail": "Cannot remove owner role from the current owner."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            if new_role == "owner" and group.owner_id != member.user_id:
                GroupMember.objects.filter(
                    group=group,
                    user_id=group.owner_id,
                ).update(role="member")
                group.owner = member.user
                group.save(update_fields=["owner"])

            serializer.save()

        return Response(GroupMemberSerializer(member).data)
