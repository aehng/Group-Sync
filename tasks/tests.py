from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APIRequestFactory

from groups.models import Group, GroupMember
from users.models import User

from .models import Task
from .Serializers import TaskSerializer


class TaskModelTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='creator',
			email='creator@example.com',
			password='TestPass123!'
		)
		self.group = Group.objects.create(name='Test Group', owner=self.user)
		GroupMember.objects.create(group=self.group, user=self.user, role='owner')

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
		self.outsider = User.objects.create_user(
			username='outsider',
			email='outsider@example.com',
			password='TestPass123!'
		)
		self.group = Group.objects.create(name='Task Group', owner=self.creator)
		GroupMember.objects.create(group=self.group, user=self.creator, role='owner')
		GroupMember.objects.create(group=self.group, user=self.assignee, role='member')

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

	def test_serializer_rejects_assigning_outside_group(self):
		request = self.factory.post('/api/groups/1/tasks/')
		request.user = self.creator

		data = {
			'title': 'Invalid Assignment',
			'group': self.group.id,
			'assigned_to': self.outsider.id,
		}
		serializer = TaskSerializer(data=data, context={'request': request})

		self.assertFalse(serializer.is_valid())
		self.assertIn('assigned_to', serializer.errors)

	def test_serializer_maps_legacy_status_values(self):
		request = self.factory.post('/api/groups/1/tasks/')
		request.user = self.creator

		data = {
			'title': 'Legacy Status Task',
			'group': self.group.id,
			'status': 'completed',
		}
		serializer = TaskSerializer(data=data, context={'request': request})
		self.assertTrue(serializer.is_valid(), serializer.errors)

		task = serializer.save()
		self.assertEqual(task.status, 'done')


class TaskEndpointTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.owner = User.objects.create_user(username='owner', email='owner@example.com', password='TestPass123!')
		self.member = User.objects.create_user(username='member', email='member@example.com', password='TestPass123!')
		self.assignee = User.objects.create_user(username='assignee', email='assignee@example.com', password='TestPass123!')
		self.non_member = User.objects.create_user(username='outsider', email='outsider@example.com', password='TestPass123!')

		self.group = Group.objects.create(name='Team Group', owner=self.owner)
		GroupMember.objects.create(group=self.group, user=self.owner, role='owner')
		GroupMember.objects.create(group=self.group, user=self.member, role='member')
		GroupMember.objects.create(group=self.group, user=self.assignee, role='member')

		self.task = Task.objects.create(
			title='Initial Task',
			description='Initial description',
			group=self.group,
			created_by=self.member,
			assigned_to=self.assignee,
			status='todo',
			due_date=timezone.now() + timedelta(days=2),
		)
		self.unassigned_task = Task.objects.create(
			title='Unassigned Task',
			description='No assignee',
			group=self.group,
			created_by=self.member,
			status='doing',
			due_date=timezone.now() + timedelta(days=5),
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
		self.assertEqual(len(response.data), 2)

		response = self.client.get(self._group_tasks_url(), {'status': 'todo'})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['status'], 'todo')

		response = self.client.get(self._group_tasks_url(), {'status': 'completed'})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 0)

		response = self.client.get(self._group_tasks_url(), {'assigned_to': self.assignee.id})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)

		response = self.client.get(self._group_tasks_url(), {'unassigned': 'true'})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], self.unassigned_task.id)

		due_before = (timezone.now() + timedelta(days=3)).isoformat()
		response = self.client.get(self._group_tasks_url(), {'due_before': due_before})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], self.task.id)

		due_after = (timezone.now() + timedelta(days=3)).isoformat()
		response = self.client.get(self._group_tasks_url(), {'due_after': due_after})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], self.unassigned_task.id)

	def test_list_tasks_invalid_due_before_and_ordering_returns_400(self):
		self.client.force_authenticate(user=self.member)

		response = self.client.get(self._group_tasks_url(), {'due_before': 'bad-date'})
		self.assertEqual(response.status_code, 400)

		response = self.client.get(self._group_tasks_url(), {'ordering': 'bad_field'})
		self.assertEqual(response.status_code, 400)

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

	def test_create_task_rejects_non_member_assignee(self):
		self.client.force_authenticate(user=self.member)
		payload = {
			'title': 'Invalid assignee task',
			'assigned_to': self.non_member.id,
		}
		response = self.client.post(self._group_tasks_url(), payload, format='json')
		self.assertEqual(response.status_code, 400)

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

	def test_patch_status_endpoint_accepts_canonical_and_legacy_statuses(self):
		self.client.force_authenticate(user=self.assignee)

		response = self.client.patch(self._group_task_status_url(), {'status': 'done'}, format='json')
		self.assertEqual(response.status_code, 200)
		self.task.refresh_from_db()
		self.assertEqual(self.task.status, 'done')

		response = self.client.patch(self._group_task_status_url(), {'status': 'in_progress'}, format='json')
		self.assertEqual(response.status_code, 200)
		self.task.refresh_from_db()
		self.assertEqual(self.task.status, 'doing')

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

	def test_owner_without_groupmember_still_has_access(self):
		GroupMember.objects.filter(group=self.group, user=self.owner).delete()

		self.client.force_authenticate(user=self.owner)
		list_response = self.client.get(self._group_tasks_url())
		self.assertEqual(list_response.status_code, 200)

		detail_response = self.client.get(self._group_task_detail_url())
		self.assertEqual(detail_response.status_code, 200)


class TaskEdgeCaseTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.owner = User.objects.create_user(username='owner_w67', email='owner_w67@example.com', password='TestPass123!')
		self.member = User.objects.create_user(username='member_w67', email='member_w67@example.com', password='TestPass123!')
		self.assignee = User.objects.create_user(username='assignee_w67', email='assignee_w67@example.com', password='TestPass123!')

		self.group = Group.objects.create(name='W67 Group', owner=self.owner)
		GroupMember.objects.create(group=self.group, user=self.owner, role='owner')
		GroupMember.objects.create(group=self.group, user=self.member, role='member')
		GroupMember.objects.create(group=self.group, user=self.assignee, role='member')

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
		GroupMember.objects.filter(group=self.group, user=self.assignee).delete()

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
