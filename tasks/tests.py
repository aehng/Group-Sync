"""
Unit tests for the Tasks app.

Covers:
- Task model defaults and __str__
- Task serializer create behavior
- Task serializer output fields
"""

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from users.models import User
from groups.models import Group
from .models import Task
from .Serializers import TaskSerializer


class TaskModelTests(TestCase):
	"""Test Task model behavior"""

	def setUp(self):
		self.user = User.objects.create_user(
			username='creator',
			email='creator@example.com',
			password='TestPass123!'
		)
		self.group = Group.objects.create(
			name='Test Group',
			description='Group for task tests',
			created_by=self.user
		)

	def test_task_defaults_and_str(self):
		"""Task defaults should be set and __str__ should return title"""
		task = Task.objects.create(
			title='Test Task',
			description='Test description',
			group=self.group,
			created_by=self.user
		)

		self.assertEqual(task.status, 'pending')
		self.assertEqual(task.priority, 'medium')
		self.assertEqual(str(task), 'Test Task')


class TaskSerializerTests(TestCase):
	"""Test Task serializer behavior"""

	def setUp(self):
		self.factory = APIRequestFactory()
		self.creator = User.objects.create_user(
			username='creator',
			email='creator@example.com',
			password='TestPass123!'
		)
		self.assignee = User.objects.create_user(
			username='assignee',
			email='assignee@example.com',
			password='TestPass123!'
		)
		self.group = Group.objects.create(
			name='Task Group',
			description='Group for serializer tests',
			created_by=self.creator
		)

	def test_serializer_create_sets_created_by(self):
		"""Serializer should set created_by from request context"""
		request = self.factory.post('/api/groups/1/tasks/')
		request.user = self.creator

		data = {
			'title': 'Serializer Task',
			'description': 'From serializer',
			'group': self.group.id,
			'assigned_to': self.assignee.id,
			'due_date': timezone.now().isoformat(),
			'status': 'pending',
			'priority': 'low',
		}

		serializer = TaskSerializer(data=data, context={'request': request})
		self.assertTrue(serializer.is_valid(), serializer.errors)
		task = serializer.save()

		self.assertEqual(task.created_by, self.creator)
		self.assertEqual(task.assigned_to, self.assignee)

	def test_serializer_output_fields(self):
		"""Serializer output should include username and group name fields"""
		task = Task.objects.create(
			title='Output Task',
			description='Output test',
			group=self.group,
			created_by=self.creator,
			assigned_to=self.assignee
		)

		serializer = TaskSerializer(task)
		data = serializer.data

		self.assertEqual(data['assigned_to_username'], 'assignee')
		self.assertEqual(data['created_by_username'], 'creator')
		self.assertEqual(data['group_name'], 'Task Group')
