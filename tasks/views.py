from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .Serializers import TaskSerializer
from groups.models import Group, GroupMember


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']

    def get_queryset(self):
        user = self.request.user
        # Users can see tasks from groups they belong to or own.
        return Task.objects.filter(
            Q(group__members__user=user) | Q(group__owner=user)
        ).select_related('group', 'assigned_to', 'created_by').distinct()

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to the current user"""
        tasks = self.get_queryset().filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def created_by_me(self, request):
        """Get tasks created by the current user"""
        tasks = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """Mark a task as completed"""
        task = self.get_object()
        task.status = 'done'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class TaskListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    STATUS_ALIASES = {
        'pending': 'todo',
        'in_progress': 'doing',
        'completed': 'done',
    }

    ALLOWED_ORDERING = {
        'created_at',
        '-created_at',
        'due_date',
        '-due_date',
        'priority',
        '-priority',
        'status',
        '-status',
    }

    @staticmethod
    def _is_group_member(group, user):
        return GroupMember.objects.filter(group=group, user=user).exists() or group.owner_id == user.id

    def _apply_filters(self, request, tasks):
        status_filter = request.query_params.get('status')
        if status_filter:
            status_filter = self.STATUS_ALIASES.get(status_filter, status_filter)
            tasks = tasks.filter(status=status_filter)

        assigned_to = request.query_params.get('assigned_to')
        if assigned_to:
            tasks = tasks.filter(assigned_to_id=assigned_to)

        unassigned = request.query_params.get('unassigned')
        if unassigned and unassigned.lower() in {'1', 'true', 'yes'}:
            tasks = tasks.filter(assigned_to__isnull=True)

        due_before = request.query_params.get('due_before')
        if due_before:
            due_before_dt = parse_datetime(due_before)
            if not due_before_dt:
                return None, Response(
                    {'error': 'Invalid due_before. Use ISO 8601 datetime.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tasks = tasks.filter(due_date__lte=due_before_dt)

        due_after = request.query_params.get('due_after')
        if due_after:
            due_after_dt = parse_datetime(due_after)
            if not due_after_dt:
                return None, Response(
                    {'error': 'Invalid due_after. Use ISO 8601 datetime.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tasks = tasks.filter(due_date__gte=due_after_dt)

        ordering = request.query_params.get('ordering', '-created_at')
        if ordering not in self.ALLOWED_ORDERING:
            return None, Response(
                {'error': 'Invalid ordering field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return tasks.order_by(ordering), None

    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if not self._is_group_member(group, request.user):
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        tasks = Task.objects.filter(group=group).select_related('group', 'assigned_to', 'created_by')
        tasks, error_response = self._apply_filters(request, tasks)
        if error_response:
            return error_response

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if not self._is_group_member(group, request.user):
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(data=request.data, context={'request': request, 'group': group})
        if serializer.is_valid():
            task = serializer.save(group=group, status='todo')
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def _is_group_member(group, user):
        return GroupMember.objects.filter(group=group, user=user).exists() or group.owner_id == user.id

    def _get_group_and_task(self, request, group_id, task_id):
        group = get_object_or_404(Group, id=group_id)
        if not self._is_group_member(group, request.user):
            return None, None, Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        task = get_object_or_404(Task, id=task_id, group=group)
        return group, task, None

    def get(self, request, group_id, task_id):
        _, task, error_response = self._get_group_and_task(request, group_id, task_id)
        if error_response:
            return error_response

        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, group_id, task_id):
        group, task, error_response = self._get_group_and_task(request, group_id, task_id)
        if error_response:
            return error_response

        is_creator = task.created_by_id == request.user.id
        is_assignee = task.assigned_to_id == request.user.id
        is_owner = group.owner_id == request.user.id

        if not (is_creator or is_assignee or is_owner):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(task, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, group_id, task_id):
        group, task, error_response = self._get_group_and_task(request, group_id, task_id)
        if error_response:
            return error_response

        is_creator = task.created_by_id == request.user.id
        is_owner = group.owner_id == request.user.id
        if not (is_creator or is_owner):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def _is_group_member(group, user):
        return GroupMember.objects.filter(group=group, user=user).exists() or group.owner_id == user.id

    def patch(self, request, group_id, task_id):
        group = get_object_or_404(Group, id=group_id)
        if not self._is_group_member(group, request.user):
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        task = get_object_or_404(Task, id=task_id, group=group)

        is_creator = task.created_by_id == request.user.id
        is_assignee = task.assigned_to_id == request.user.id
        is_owner = group.owner_id == request.user.id

        if not (is_creator or is_assignee or is_owner):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(task, data={'status': request.data.get('status')}, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
