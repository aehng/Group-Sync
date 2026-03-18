jest.mock("./client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { api } from "./client";
import { listGroupMeetings, getMeeting, createMeeting, updateMeeting, deleteMeeting } from "./meetings";

describe("meetings API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listGroupMeetings calls endpoint and returns data", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, title: "Meet" }] });
    const data = await listGroupMeetings(7);
    expect(api.get).toHaveBeenCalledWith(`/api/groups/7/meetings/`);
    expect(data).toEqual([{ id: 1, title: "Meet" }]);
  });

  test("getMeeting calls detail endpoint", async () => {
    api.get.mockResolvedValue({ data: { id: 2, title: "M2" } });
    const data = await getMeeting(7, 2);
    expect(api.get).toHaveBeenCalledWith(`/api/groups/7/meetings/2/`);
    expect(data).toEqual({ id: 2, title: "M2" });
  });

  test("createMeeting posts to meetings endpoint", async () => {
    api.post.mockResolvedValue({ data: { id: 3, title: "NewMeet" } });
    const created = await createMeeting(7, { title: "NewMeet" });
    expect(api.post).toHaveBeenCalledWith(`/api/groups/7/meetings/`, { title: "NewMeet" });
    expect(created).toEqual({ id: 3, title: "NewMeet" });
  });

  test("updateMeeting patches meeting", async () => {
    api.patch.mockResolvedValue({ data: { id: 3, title: "Updated" } });
    const res = await updateMeeting(7, 3, { title: "Updated" });
    expect(api.patch).toHaveBeenCalledWith(`/api/groups/7/meetings/3/`, { title: "Updated" });
    expect(res).toEqual({ id: 3, title: "Updated" });
  });

  test("deleteMeeting calls delete endpoint", async () => {
    api.delete.mockResolvedValue({ data: {} });
    const res = await deleteMeeting(7, 3);
    expect(api.delete).toHaveBeenCalledWith(`/api/groups/7/meetings/3/`);
    expect(res).toEqual({});
  });
});
