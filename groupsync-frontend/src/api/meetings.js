import { api } from "./client";

/**
 * Fetch all meetings for a group
 */
export async function listGroupMeetings(groupId, filters = {}) {
  const res = await api.get(`/api/groups/${groupId}/meetings/`, {
    params: filters,
  });
  return res.data;
}

/**
 * Fetch a single meeting by ID
 */
export async function getMeeting(groupId, meetingId) {
  const res = await api.get(`/api/groups/${groupId}/meetings/${meetingId}/`);
  return res.data;
}

/**
 * Create a new meeting in a group
 */
export async function createMeeting(groupId, data) {
  const res = await api.post(`/api/groups/${groupId}/meetings/`, data);
  return res.data;
}

/**
 * Update a meeting
 */
export async function updateMeeting(groupId, meetingId, data) {
  const res = await api.patch(
    `/api/groups/${groupId}/meetings/${meetingId}/`,
    data
  );
  return res.data;
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(groupId, meetingId) {
  const res = await api.delete(`/api/groups/${groupId}/meetings/${meetingId}/`);
  return res.data;
}
