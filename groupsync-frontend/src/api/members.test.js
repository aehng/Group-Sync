jest.mock("./client", () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

import { api } from "./client";
import { listGroupMembers, updateMemberRole } from "./members";

describe("members API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listGroupMembers calls endpoint and returns members", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, user: { username: "u1" } }] });
    const data = await listGroupMembers(9);
    expect(api.get).toHaveBeenCalledWith(`/api/groups/9/members/`);
    expect(data).toEqual([{ id: 1, user: { username: "u1" } }]);
  });

  test("updateMemberRole puts role and returns updated member", async () => {
    api.put.mockResolvedValue({ data: { id: 1, role: "owner" } });
    const res = await updateMemberRole(9, 1, "owner");
    expect(api.put).toHaveBeenCalledWith(`/api/groups/9/members/1/`, { role: "owner" });
    expect(res).toEqual({ id: 1, role: "owner" });
  });
});
