from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from django.contrib.auth import get_user_model
from groups.models import Group
from .models import Message


User = get_user_model()


class MessagingAPITest(TestCase):
	def setUp(self):
		self.client = APIClient()
		# Create users
		self.user_member = User.objects.create_user(username="member", password="pass")
		self.user_nonmember = User.objects.create_user(username="outsider", password="pass")

		# Create group and add member
		self.group = Group.objects.create(name="Test Group", description="test", created_by=self.user_member)
		self.group.members.add(self.user_member)

		# Endpoint base
		self.url = f"/api/groups/{self.group.id}/messages/"

	def test_member_can_post_and_retrieve_message(self):
		self.client.force_authenticate(self.user_member)

		# Post a message
		res = self.client.post(self.url, {"content": "Hello world"}, format="json")
		self.assertEqual(res.status_code, status.HTTP_201_CREATED)
		self.assertIn("content", res.data)
		self.assertEqual(res.data["content"], "Hello world")

		# Retrieve messages
		res = self.client.get(self.url)
		self.assertEqual(res.status_code, status.HTTP_200_OK)
		self.assertTrue(len(res.data["results"]) >= 1)

	def test_non_member_cannot_access_or_post(self):
		self.client.force_authenticate(self.user_nonmember)

		# GET should be forbidden
		res = self.client.get(self.url)
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

		# POST should be forbidden
		res = self.client.post(self.url, {"content": "Nope"}, format="json")
		self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

