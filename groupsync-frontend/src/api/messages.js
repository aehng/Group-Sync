import { api } from "./client";

export async function listGroupMessages(groupId, { limit = 30, before } = {}) {
  const params = { limit };
  if (before) params.before = before;

  const res = await api.get(`/api/groups/${groupId}/messages/`, { params });
  return res.data;
}

export async function sendGroupMessage(groupId, content) {
  const res = await api.post(`/api/groups/${groupId}/messages/`, { content });
  return res.data;
}
