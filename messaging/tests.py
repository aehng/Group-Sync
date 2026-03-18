from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from django.contrib.auth import get_user_model
from groups.models import Group, GroupMember
from .models import Message


User = get_user_model()


class MessagingAPITest(TestCase):
    """Comprehensive API tests for messaging endpoints.

    These tests verify that only group members can list/post messages,
    pagination works correctly, and message creation/retrieval behaves as expected.
    Covers features implemented in weeks 8-9: integration and polish.
    """
    def setUp(self):
        self.client = APIClient()
        # Create users
        self.user_member = User.objects.create_user(username="member", password="pass")
        self.user_nonmember = User.objects.create_user(username="outsider", password="pass")
        self.user_member2 = User.objects.create_user(username="member2", password="pass")

        # Create group and add members
        self.group = Group.objects.create(name="Test Group", owner=self.user_member)
        GroupMember.objects.create(group=self.group, user=self.user_member, role='owner')
        GroupMember.objects.create(group=self.group, user=self.user_member2, role='member')

        # Endpoint base
        self.url = f"/api/groups/{self.group.id}/messages/"

    def test_member_can_post_and_retrieve_message(self):
        self.client.force_authenticate(self.user_member)

        # Post a message
        res = self.client.post(self.url, {"content": "Hello world"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("content", res.data)
        self.assertEqual(res.data["content"], "Hello world")
        self.assertEqual(res.data["sender"]["username"], "member")

        # Retrieve messages
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 1)
        self.assertEqual(res.data["results"][0]["content"], "Hello world")

    def test_non_member_cannot_access_or_post(self):
        self.client.force_authenticate(self.user_nonmember)

        # GET should be forbidden
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # POST should be forbidden
        res = self.client.post(self.url, {"content": "Nope"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_pagination_works(self):
        self.client.force_authenticate(self.user_member)

        # Create 60 messages
        for i in range(60):
            Message.objects.create(
                group=self.group,
                sender=self.user_member,
                content=f"Message {i}"
            )

        # Get first page (should have 50 messages)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 50)
        self.assertIn("next", res.data)
        self.assertIsNotNone(res.data["next"])

        # Get next page
        next_url = res.data["next"]
        res = self.client.get(next_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 10)  # Remaining messages

    def test_recent_messages_endpoint(self):
        self.client.force_authenticate(self.user_member)

        # Create 20 messages
        for i in range(20):
            Message.objects.create(
                group=self.group,
                sender=self.user_member,
                content=f"Message {i}"
            )

        # Get recent 5
        res = self.client.get(f"{self.url}recent/?count=5")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 5)

        # Get recent 10 (default)
        res = self.client.get(f"{self.url}recent/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 10)

        # Cap at 50
        res = self.client.get(f"{self.url}recent/?count=100")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 20)  # Only 20 exist

    def test_serializer_validation(self):
        self.client.force_authenticate(self.user_member)

        # Empty content should fail
        res = self.client.post(self.url, {"content": ""}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing content should fail
        res = self.client.post(self.url, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_messages_ordered_by_created_at_desc(self):
        self.client.force_authenticate(self.user_member)

        # Create messages with delays
        import time
        msg1 = Message.objects.create(group=self.group, sender=self.user_member, content="First")
        time.sleep(0.01)
        msg2 = Message.objects.create(group=self.group, sender=self.user_member, content="Second")

        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 2)
        # Should be newest first
        self.assertEqual(res.data["results"][0]["content"], "Second")
        self.assertEqual(res.data["results"][1]["content"], "First")

    def test_multiple_users_can_post(self):
        self.client.force_authenticate(self.user_member)

        # Member1 posts
        res = self.client.post(self.url, {"content": "From member1"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Switch to member2
        self.client.force_authenticate(self.user_member2)
        res = self.client.post(self.url, {"content": "From member2"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Check both messages exist
        res = self.client.get(self.url)
        self.assertEqual(len(res.data["results"]), 2)
        senders = [msg["sender"]["username"] for msg in res.data["results"]]
        self.assertIn("member", senders)
        self.assertIn("member2", senders)
