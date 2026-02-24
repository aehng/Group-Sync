import { api } from "./client";

// Fetch messages. If `cursorUrl` is provided and is a full URL (from `next`),
// the function will fetch that URL directly; otherwise it will call the group messages endpoint.
export async function listGroupMessages(groupId, { limit = 30, cursorUrl } = {}) {
  if (cursorUrl && (cursorUrl.startsWith("http://") || cursorUrl.startsWith("https://"))) {
    const res = await api.get(cursorUrl);
    return res.data;
  }

  const params = { limit };
  const res = await api.get(`/api/groups/${groupId}/messages/`, { params });
  return res.data;
}

export async function sendGroupMessage(groupId, content) {
  const res = await api.post(`/api/groups/${groupId}/messages/`, { content });
  return res.data;
}
