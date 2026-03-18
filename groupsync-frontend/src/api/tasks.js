import { api } from "./client";

/**
 * Fetch all tasks for a group
 */
export async function listGroupTasks(groupId, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  const url = query
    ? `/api/groups/${groupId}/tasks/?${query}`
    : `/api/groups/${groupId}/tasks/`;
  const res = await api.get(url);
  return res.data;
}

/**
 * Fetch a single task by ID
 */
export async function getTask(groupId, taskId) {
  const res = await api.get(`/api/groups/${groupId}/tasks/${taskId}/`);
  return res.data;
}

/**
 * Create a new task in a group
 */
export async function createTask(groupId, data) {
  const res = await api.post(`/api/groups/${groupId}/tasks/`, data);
  return res.data;
}

/**
 * Update a task by ID
 */
export async function updateTask(groupId, taskId, data) {
  const res = await api.put(`/api/groups/${groupId}/tasks/${taskId}/`, data);
  return res.data;
}

/**
 * Update task status
 */
export async function updateTaskStatus(groupId, taskId, status) {
  const res = await api.patch(
    `/api/groups/${groupId}/tasks/${taskId}/status/`,
    { status }
  );
  return res.data;
}

/**
 * Delete a task
 */
export async function deleteTask(groupId, taskId) {
  const res = await api.delete(`/api/groups/${groupId}/tasks/${taskId}/`);
  return res.data;
}
