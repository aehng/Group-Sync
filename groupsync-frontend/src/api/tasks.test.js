jest.mock("./client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { api } from "./client";
import {
  listGroupTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "./tasks";

describe("tasks API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listGroupTasks calls correct endpoint and returns data", async () => {
    api.get.mockResolvedValue({ data: { results: [{ id: 10, title: "Task" }] } });
    const data = await listGroupTasks(5);
    expect(api.get).toHaveBeenCalledWith(`/api/groups/5/tasks/`);
    expect(data).toEqual({ results: [{ id: 10, title: "Task" }] });
  });

  test("listGroupTasks supports query filters", async () => {
    api.get.mockResolvedValue({ data: { results: [] } });
    await listGroupTasks(5, { status: "todo", assigned_to: 3 });
    expect(api.get).toHaveBeenCalledWith(`/api/groups/5/tasks/?status=todo&assigned_to=3`);
  });

  test("getTask calls task detail endpoint", async () => {
    api.get.mockResolvedValue({ data: { id: 11, title: "T2" } });
    const data = await getTask(5, 11);
    expect(api.get).toHaveBeenCalledWith(`/api/groups/5/tasks/11/`);
    expect(data).toEqual({ id: 11, title: "T2" });
  });

  test("createTask posts to group tasks endpoint", async () => {
    const payload = { title: "New" };
    api.post.mockResolvedValue({ data: { id: 20, ...payload } });
    const created = await createTask(5, payload);
    expect(api.post).toHaveBeenCalledWith(`/api/groups/5/tasks/`, payload);
    expect(created).toEqual({ id: 20, ...payload });
  });

  test("updateTask puts task payload", async () => {
    const payload = { title: "Updated" };
    api.put.mockResolvedValue({ data: { id: 21, ...payload } });
    const data = await updateTask(5, 21, payload);
    expect(api.put).toHaveBeenCalledWith(`/api/groups/5/tasks/21/`, payload);
    expect(data).toEqual({ id: 21, ...payload });
  });

  test("updateTaskStatus patches status", async () => {
    api.patch.mockResolvedValue({ data: { id: 21, status: "completed" } });
    const res = await updateTaskStatus(5, 21, "completed");
    expect(api.patch).toHaveBeenCalledWith(`/api/groups/5/tasks/21/status/`, { status: "completed" });
    expect(res).toEqual({ id: 21, status: "completed" });
  });

  test("deleteTask calls delete endpoint", async () => {
    api.delete.mockResolvedValue({ data: {} });
    const res = await deleteTask(5, 30);
    expect(api.delete).toHaveBeenCalledWith(`/api/groups/5/tasks/30/`);
    expect(res).toEqual({});
  });
});
