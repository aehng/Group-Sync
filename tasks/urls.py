from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskListCreateView, TaskDetailView, TaskStatusUpdateView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
	path('groups/<int:group_id>/tasks/', TaskListCreateView.as_view(), name='group-tasks'),
	path('groups/<int:group_id>/tasks/<int:task_id>/', TaskDetailView.as_view(), name='group-task-detail'),
	path('groups/<int:group_id>/tasks/<int:task_id>/status/', TaskStatusUpdateView.as_view(), name='group-task-status'),
]

urlpatterns += router.urls
