from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APIRequestFactory

from users.models import User
from groups.models import Group
from .models import Task
from .Serializers import TaskSerializer


class TaskModelTests(TestCase):
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
		task = Task.objects.create(
			title='Test Task',
			description='Test description',
			group=self.group,
			created_by=self.user
		)

		self.assertEqual(task.status, 'todo')
		self.assertEqual(task.priority, 'medium')
		self.assertEqual(str(task), 'Test Task')


class TaskSerializerTests(TestCase):
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
		request = self.factory.post('/api/groups/1/tasks/')
		request.user = self.creator

		data = {
			'title': 'Serializer Task',
			'description': 'From serializer',
			'group': self.group.id,
			'assigned_to': self.assignee.id,
			'due_date': timezone.now().isoformat(),
			'status': 'doing',
			'priority': 'low',
		}

		serializer = TaskSerializer(data=data, context={'request': request})
		self.assertTrue(serializer.is_valid(), serializer.errors)
		task = serializer.save()

		self.assertEqual(task.created_by, self.creator)
		self.assertEqual(task.assigned_to, self.assignee)

	def test_serializer_output_fields(self):
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
		self.assertEqual(data['assigned_to_details']['email'], 'assignee@example.com')
		self.assertEqual(data['created_by_details']['email'], 'creator@example.com')
		self.assertEqual(data['group_details']['name'], 'Task Group')


class TaskEndpointTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.owner = User.objects.create_user(username='owner', email='owner@example.com', password='TestPass123!')
		self.member = User.objects.create_user(username='member', email='member@example.com', password='TestPass123!')
		self.assignee = User.objects.create_user(username='assignee', email='assignee@example.com', password='TestPass123!')
		self.non_member = User.objects.create_user(username='outsider', email='outsider@example.com', password='TestPass123!')

		self.group = Group.objects.create(name='Team Group', description='desc', created_by=self.owner)
		self.group.members.add(self.owner, self.member, self.assignee)

		self.task = Task.objects.create(
			title='Initial Task',
			description='Initial description',
			group=self.group,
			created_by=self.member,
			assigned_to=self.assignee,
			status='todo'
		)

	def _group_tasks_url(self):
		return reverse('group-tasks', kwargs={'group_id': self.group.id})

	def _group_task_detail_url(self):
		return reverse('group-task-detail', kwargs={'group_id': self.group.id, 'task_id': self.task.id})

	def _group_task_status_url(self):
		return reverse('group-task-status', kwargs={'group_id': self.group.id, 'task_id': self.task.id})

	def test_list_tasks_member_can_view_and_filter(self):
		self.client.force_authenticate(user=self.member)

		response = self.client.get(self._group_tasks_url())
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)

		response = self.client.get(self._group_tasks_url(), {'status': 'todo'})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)

		response = self.client.get(self._group_tasks_url(), {'assigned_to': self.assignee.id})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)

	def test_list_tasks_non_member_forbidden(self):
		self.client.force_authenticate(user=self.non_member)
		response = self.client.get(self._group_tasks_url())
		self.assertEqual(response.status_code, 403)

	def test_get_single_task_member_allowed_non_member_forbidden(self):
		self.client.force_authenticate(user=self.member)
		response = self.client.get(self._group_task_detail_url())
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['id'], self.task.id)

		self.client.force_authenticate(user=self.non_member)
		response = self.client.get(self._group_task_detail_url())
		self.assertEqual(response.status_code, 403)

	def test_create_task_sets_created_by_and_forces_todo_status(self):
		self.client.force_authenticate(user=self.member)
		payload = {
			'title': 'New Task',
			'description': 'Created from test',
			'assigned_to': self.assignee.id,
			'due_date': timezone.now().isoformat(),
			'status': 'done',
		}

		response = self.client.post(self._group_tasks_url(), payload, format='json')
		self.assertEqual(response.status_code, 201)

		created_task = Task.objects.get(id=response.data['id'])
		self.assertEqual(created_task.created_by_id, self.member.id)
		self.assertEqual(created_task.status, 'todo')

	def test_update_task_permissions(self):
		payload = {'title': 'Updated Title', 'status': 'doing'}

		self.client.force_authenticate(user=self.member)
		response = self.client.put(self._group_task_detail_url(), payload, format='json')
		self.assertEqual(response.status_code, 200)

		self.client.force_authenticate(user=self.assignee)
		response = self.client.put(self._group_task_detail_url(), {'description': 'Assignee edit'}, format='json')
		self.assertEqual(response.status_code, 200)

		self.client.force_authenticate(user=self.owner)
		response = self.client.put(self._group_task_detail_url(), {'description': 'Owner edit'}, format='json')
		self.assertEqual(response.status_code, 200)

		self.client.force_authenticate(user=self.non_member)
		response = self.client.put(self._group_task_detail_url(), {'description': 'Nope'}, format='json')
		self.assertEqual(response.status_code, 403)

	def test_delete_task_permissions(self):
		self.client.force_authenticate(user=self.assignee)
		response = self.client.delete(self._group_task_detail_url())
		self.assertEqual(response.status_code, 403)

		self.client.force_authenticate(user=self.owner)
		response = self.client.delete(self._group_task_detail_url())
		self.assertEqual(response.status_code, 204)

	def test_patch_status_endpoint(self):
		self.client.force_authenticate(user=self.assignee)
		response = self.client.patch(self._group_task_status_url(), {'status': 'done'}, format='json')
		self.assertEqual(response.status_code, 200)
		self.task.refresh_from_db()
		self.assertEqual(self.task.status, 'done')

		response = self.client.patch(self._group_task_status_url(), {'status': 'invalid_status'}, format='json')
		self.assertEqual(response.status_code, 400)

	def test_non_member_cannot_create_task(self):
		self.client.force_authenticate(user=self.non_member)
		payload = {
			'title': 'Should Fail',
			'description': 'Outsider create attempt',
		}
		response = self.client.post(self._group_tasks_url(), payload, format='json')
		self.assertEqual(response.status_code, 403)

	def test_status_filter_returns_expected_subset(self):
		Task.objects.create(
			title='Done Task',
			description='Completed work',
			group=self.group,
			created_by=self.owner,
			assigned_to=self.member,
			status='done'
		)

		self.client.force_authenticate(user=self.member)
		response = self.client.get(self._group_tasks_url(), {'status': 'done'})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['status'], 'done')


class TaskWeek67EdgeCaseTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.owner = User.objects.create_user(username='owner_w67', email='owner_w67@example.com', password='TestPass123!')
		self.member = User.objects.create_user(username='member_w67', email='member_w67@example.com', password='TestPass123!')
		self.assignee = User.objects.create_user(username='assignee_w67', email='assignee_w67@example.com', password='TestPass123!')

		self.group = Group.objects.create(name='W67 Group', description='integration', created_by=self.owner)
		self.group.members.add(self.owner, self.member, self.assignee)

		self.task = Task.objects.create(
			title='Week67 Task',
			description='Edge case task',
			group=self.group,
			created_by=self.member,
			assigned_to=self.assignee,
			status='doing'
		)

	def _group_tasks_url(self):
		return reverse('group-tasks', kwargs={'group_id': self.group.id})

	def _group_task_detail_url(self):
		return reverse('group-task-detail', kwargs={'group_id': self.group.id, 'task_id': self.task.id})

	def _group_task_status_url(self):
		return reverse('group-task-status', kwargs={'group_id': self.group.id, 'task_id': self.task.id})

	def test_group_structure_response_contains_integration_fields(self):
		self.client.force_authenticate(user=self.member)
		response = self.client.get(self._group_task_detail_url())
		self.assertEqual(response.status_code, 200)
		self.assertIn('group_details', response.data)
		self.assertIn('created_by_details', response.data)
		self.assertIn('assigned_to_details', response.data)
		self.assertEqual(response.data['group_details']['id'], self.group.id)

	def test_assigned_user_removed_from_group_loses_access(self):
		self.group.members.remove(self.assignee)

		self.client.force_authenticate(user=self.assignee)
		response = self.client.get(self._group_tasks_url())
		self.assertEqual(response.status_code, 403)

		response = self.client.patch(self._group_task_status_url(), {'status': 'done'}, format='json')
		self.assertEqual(response.status_code, 403)

	def test_null_assigned_to_is_handled_gracefully(self):
		self.task.assigned_to = None
		self.task.save()

		self.client.force_authenticate(user=self.member)
		response = self.client.get(self._group_task_detail_url())
		self.assertEqual(response.status_code, 200)
		self.assertIsNone(response.data['assigned_to'])
		self.assertIsNone(response.data['assigned_to_details'])

	def test_deleted_assigned_user_sets_null_assignee(self):
		assignee_id = self.assignee.id
		self.assignee.delete()

		self.task.refresh_from_db()
		self.assertIsNone(self.task.assigned_to)

		self.client.force_authenticate(user=self.member)
		response = self.client.get(self._group_task_detail_url())
		self.assertEqual(response.status_code, 200)
		self.assertIsNone(response.data['assigned_to_details'])
		self.assertNotEqual(response.data['created_by'], assignee_id)
