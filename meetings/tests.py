from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from groups.models import Group, GroupMember
from meetings.models import Meeting


User = get_user_model()


class MeetingsApiTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.owner = User.objects.create_user(username="owner", password="pass1234")
		self.member = User.objects.create_user(username="member", password="pass1234")
		self.other = User.objects.create_user(username="other", password="pass1234")

		self.group = Group.objects.create(name="Meetings Team", owner=self.owner)
		GroupMember.objects.create(group=self.group, user=self.owner, role="owner")
		GroupMember.objects.create(group=self.group, user=self.member, role="member")

	def test_member_can_create_and_list_meetings(self):
		self.client.force_authenticate(user=self.member)

		create_response = self.client.post(
			f"/api/groups/{self.group.id}/meetings/",
			{
				"title": "Sprint Planning",
				"description": "Plan next sprint",
				"location_or_link": "https://zoom.us/test",
				"start_time": "2099-01-01T10:00:00Z",
				"end_time": "2099-01-01T11:00:00Z",
				"agenda": "Backlog review",
			},
			format="json",
		)

		self.assertEqual(create_response.status_code, 201)
		self.assertEqual(create_response.data["title"], "Sprint Planning")

		list_response = self.client.get(f"/api/groups/{self.group.id}/meetings/")
		self.assertEqual(list_response.status_code, 200)
		self.assertEqual(len(list_response.data), 1)

	def test_non_member_cannot_list_group_meetings(self):
		Meeting.objects.create(
			group=self.group,
			author=self.owner,
			title="Private Meeting",
			start_time="2099-01-01T10:00:00Z",
			end_time="2099-01-01T11:00:00Z",
		)

		self.client.force_authenticate(user=self.other)
		response = self.client.get(f"/api/groups/{self.group.id}/meetings/")

		self.assertEqual(response.status_code, 403)
