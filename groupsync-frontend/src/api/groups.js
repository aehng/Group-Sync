import { api } from "./client";

/**
 * Fetch all groups for the current user
 */
export async function listGroups() {
  const res = await api.get("/api/groups/");
  return res.data;
}

/**
 * Fetch a single group by ID
 */
export async function getGroup(groupId) {
  const res = await api.get(`/api/groups/${groupId}/`);
  return res.data;
}

/**
 * Create a new group
 */
export async function createGroup(data) {
  const res = await api.post("/api/groups/", data);
  return res.data;
}

/**
 * Join a group with invite code
 */
export async function joinGroup(inviteCode) {
  const res = await api.post("/api/groups/join/", { invite_code: inviteCode });
  return res.data;
}

/**
 * Update a group (owner only)
 */
export async function updateGroup(groupId, data) {
  const res = await api.put(`/api/groups/${groupId}/`, data);
  return res.data;
}

/**
 * Delete a group (owner only)
 */
export async function deleteGroup(groupId) {
  const res = await api.delete(`/api/groups/${groupId}/`);
  return res.data;
}
