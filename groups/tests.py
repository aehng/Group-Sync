from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Group, GroupMember

User = get_user_model()


class GroupMembershipTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.owner = User.objects.create_user(username="owner", password="pass1234")
		self.member = User.objects.create_user(username="member", password="pass1234")
		self.other = User.objects.create_user(username="other", password="pass1234")

	def test_create_group_creates_owner_membership(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Test Group"}, format="json")

		self.assertEqual(response.status_code, 201)
		group_id = response.data["id"]
		group = Group.objects.get(id=group_id)

		self.assertTrue(group.invite_code)
		self.assertTrue(
			GroupMember.objects.filter(group=group, user=self.owner, role="owner").exists()
		)

	def test_join_group_with_invite_code(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Joinable"}, format="json")
		invite_code = response.data["invite_code"]
		group_id = response.data["id"]

		self.client.force_authenticate(user=self.member)
		join_response = self.client.post(
			"/api/groups/join/",
			{"invite_code": invite_code},
			format="json",
		)

		self.assertEqual(join_response.status_code, 201)
		self.assertEqual(join_response.data["id"], group_id)
		self.assertTrue(
			GroupMember.objects.filter(group_id=group_id, user=self.member, role="member").exists()
		)

	def test_non_member_cannot_view_members(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Private"}, format="json")
		group_id = response.data["id"]

		self.client.force_authenticate(user=self.other)
		list_response = self.client.get(f"/api/groups/{group_id}/members/")

		self.assertEqual(list_response.status_code, 403)

	def test_non_owner_cannot_update_role(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Team"}, format="json")
		group_id = response.data["id"]
		invite_code = response.data["invite_code"]

		self.client.force_authenticate(user=self.member)
		self.client.post("/api/groups/join/", {"invite_code": invite_code}, format="json")

		update_response = self.client.put(
			f"/api/groups/{group_id}/members/{self.member.id}/",
			{"role": "owner"},
			format="json",
		)

		self.assertEqual(update_response.status_code, 403)

	def test_owner_can_transfer_role(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Team"}, format="json")
		group_id = response.data["id"]
		invite_code = response.data["invite_code"]

		self.client.force_authenticate(user=self.member)
		self.client.post("/api/groups/join/", {"invite_code": invite_code}, format="json")

		self.client.force_authenticate(user=self.owner)
		update_response = self.client.put(
			f"/api/groups/{group_id}/members/{self.member.id}/",
			{"role": "owner"},
			format="json",
		)

		self.assertEqual(update_response.status_code, 200)
		group = Group.objects.get(id=group_id)
		self.assertEqual(group.owner_id, self.member.id)

	def test_non_owner_cannot_delete_group(self):
		# owner creates a group
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Team"}, format="json")
		group_id = response.data["id"]

		# member tries to delete
		self.client.force_authenticate(user=self.member)
		delete_response = self.client.delete(f"/api/groups/{group_id}/")
		self.assertEqual(delete_response.status_code, 403)
		# ensure group still exists
		self.assertTrue(Group.objects.filter(id=group_id).exists())

	def test_owner_delete_group_cascades_members(self):
		# prepare group with a member
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Cascade"}, format="json")
		group_id = response.data["id"]
		invite_code = response.data["invite_code"]

		self.client.force_authenticate(user=self.member)
		self.client.post("/api/groups/join/", {"invite_code": invite_code}, format="json")

		# owner deletes
		self.client.force_authenticate(user=self.owner)
		delete_response = self.client.delete(f"/api/groups/{group_id}/")
		self.assertEqual(delete_response.status_code, 204)
		# group gone and members removed
		self.assertFalse(Group.objects.filter(id=group_id).exists())
		self.assertFalse(GroupMember.objects.filter(group_id=group_id).exists())

	def test_owner_can_remove_member(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Team"}, format="json")
		group_id = response.data["id"]
		invite_code = response.data["invite_code"]

		self.client.force_authenticate(user=self.member)
		self.client.post("/api/groups/join/", {"invite_code": invite_code}, format="json")

		self.client.force_authenticate(user=self.owner)
		remove_response = self.client.delete(f"/api/groups/{group_id}/members/{self.member.id}/")

		self.assertEqual(remove_response.status_code, 204)
		self.assertFalse(
			GroupMember.objects.filter(group_id=group_id, user=self.member).exists()
		)

	def test_owner_cannot_remove_owner_membership(self):
		self.client.force_authenticate(user=self.owner)
		response = self.client.post("/api/groups/", {"name": "Team"}, format="json")
		group_id = response.data["id"]

		remove_response = self.client.delete(f"/api/groups/{group_id}/members/{self.owner.id}/")

		self.assertEqual(remove_response.status_code, 400)
		self.assertTrue(
			GroupMember.objects.filter(group_id=group_id, user=self.owner, role="owner").exists()
		)
