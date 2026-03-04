jest.mock("./client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { api } from "./client";
import { listGroups, getGroup, createGroup, joinGroup } from "./groups";

describe("groups API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listGroups calls /api/groups/ and returns data", async () => {
    api.get.mockResolvedValue({ data: { results: [{ id: 1, name: "Alpha" }] } });
    const data = await listGroups();
    expect(api.get).toHaveBeenCalledWith("/api/groups/");
    expect(data).toEqual({ results: [{ id: 1, name: "Alpha" }] });
  });

  test("getGroup calls /api/groups/:id/ and returns group", async () => {
    api.get.mockResolvedValue({ data: { id: 2, name: "Beta" } });
    const data = await getGroup(2);
    expect(api.get).toHaveBeenCalledWith("/api/groups/2/");
    expect(data).toEqual({ id: 2, name: "Beta" });
  });

  test("createGroup posts to /api/groups/ and returns created group", async () => {
    const payload = { name: "New Group" };
    api.post.mockResolvedValue({ data: { id: 3, ...payload } });
    const created = await createGroup(payload);
    expect(api.post).toHaveBeenCalledWith("/api/groups/", payload);
    expect(created).toEqual({ id: 3, ...payload });
  });

  test("joinGroup posts invite_code to /api/groups/join/", async () => {
    api.post.mockResolvedValue({ data: { id: 4, role: "member" } });
    const res = await joinGroup("INV123");
    expect(api.post).toHaveBeenCalledWith("/api/groups/join/", { invite_code: "INV123" });
    expect(res).toEqual({ id: 4, role: "member" });
  });
});
