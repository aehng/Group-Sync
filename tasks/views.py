from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .Serializers import TaskSerializer
from groups.models import Group


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']

    def get_queryset(self):
        user = self.request.user
        # Users can see tasks from groups they belong to or created
        return (Task.objects.filter(group__members=user) | Task.objects.filter(group__created_by=user)).distinct()

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

    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        is_member = group.members.filter(id=request.user.id).exists() or group.created_by_id == request.user.id
        if not is_member:
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        tasks = Task.objects.filter(group=group)

        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)

        assigned_to = request.query_params.get('assigned_to')
        if assigned_to:
            tasks = tasks.filter(assigned_to_id=assigned_to)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        is_member = group.members.filter(id=request.user.id).exists() or group.created_by_id == request.user.id
        if not is_member:
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            task = serializer.save(group=group, status='todo')
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_group_and_task(self, request, group_id, task_id):
        group = get_object_or_404(Group, id=group_id)
        is_member = group.members.filter(id=request.user.id).exists() or group.created_by_id == request.user.id
        if not is_member:
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
        is_owner = group.created_by_id == request.user.id

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
        is_owner = group.created_by_id == request.user.id
        if not (is_creator or is_owner):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, group_id, task_id):
        group = get_object_or_404(Group, id=group_id)
        is_member = group.members.filter(id=request.user.id).exists() or group.created_by_id == request.user.id
        if not is_member:
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)

        task = get_object_or_404(Task, id=task_id, group=group)

        is_creator = task.created_by_id == request.user.id
        is_assignee = task.assigned_to_id == request.user.id
        is_owner = group.created_by_id == request.user.id

        if not (is_creator or is_assignee or is_owner):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(task, data={'status': request.data.get('status')}, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
