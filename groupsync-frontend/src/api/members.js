import { api } from "./client";

/**
 * Fetch all members of a group
 */
export async function listGroupMembers(groupId) {
  const res = await api.get(`/api/groups/${groupId}/members/`);
  return res.data;
}

/**
 * Update a member's role
 */
export async function updateMemberRole(groupId, userId, role) {
  const res = await api.put(`/api/groups/${groupId}/members/${userId}/`, {
    role,
  });
  return res.data;
}

/**
 * Remove a member from a group (owner only)
 */
export async function removeGroupMember(groupId, userId) {
  const res = await api.delete(`/api/groups/${groupId}/members/${userId}/`);
  return res.data;
}
