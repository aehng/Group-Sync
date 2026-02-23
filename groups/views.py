from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Group, GroupMember
from .serializers import (
    GroupSerializer,
    GroupCreateSerializer,
    GroupDetailSerializer,
    GroupMemberSerializer,
    InviteCodeSerializer,
)


class GroupListCreateView(APIView):
    """
    GET: List all groups the authenticated user belongs to.
    POST: Create a new group with the authenticated user as owner.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get all groups the user belongs to (as a member)
        groups = Group.objects.filter(members__user=request.user).distinct()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = GroupCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create group with authenticated user as owner
            group = serializer.save(owner=request.user)
            # Auto-add owner as a GroupMember with role 'owner'
            GroupMember.objects.create(group=group, user=request.user, role='owner')
            # Return the full group data
            response_serializer = GroupSerializer(group)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupDetailView(APIView):
    """
    GET: Retrieve details of a specific group (only for members).
    PUT: Update group name (owner only).
    DELETE: Delete group (owner only).
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        # Check if user is a member
        if not group.members.filter(user=request.user).exists():
            return Response(
                {'error': 'You are not a member of this group'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = GroupDetailSerializer(group)
        return Response(serializer.data)
    
    def put(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        # Check if user is the owner
        if group.owner != request.user:
            return Response(
                {'error': 'Only the group owner can update the group'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = GroupCreateSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = GroupDetailSerializer(group)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        # Check if user is the owner
        if group.owner != request.user:
            return Response(
                {'error': 'Only the group owner can delete the group'},
                status=status.HTTP_403_FORBIDDEN
            )
        group.delete()
        return Response(
            {'message': 'Group deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class JoinGroupView(APIView):
    """
    POST: Join a group using an invite code.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = InviteCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        invite_code = serializer.validated_data['invite_code']
        
        # Find group by invite code
        try:
            group = Group.objects.get(invite_code=invite_code)
        except Group.DoesNotExist:
            return Response(
                {'error': 'Invalid invite code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is already a member
        if GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(
                {'error': 'You are already a member of this group'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user as a member
        GroupMember.objects.create(group=group, user=request.user, role='member')
        response_serializer = GroupDetailSerializer(group)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class GroupMembersView(APIView):
    """
    GET: List all members of a group (only for members).
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        # Check if user is a member
        if not group.members.filter(user=request.user).exists():
            return Response(
                {'error': 'You are not a member of this group'},
                status=status.HTTP_403_FORBIDDEN
            )
        members = group.members.all()
        serializer = GroupMemberSerializer(members, many=True)
        return Response(serializer.data)
