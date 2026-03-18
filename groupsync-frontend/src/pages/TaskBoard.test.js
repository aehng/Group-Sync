import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TaskBoard from "./TaskBoard";

jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useParams: () => ({ groupId: "1" }),
}));

jest.mock("../api/tasks", () => ({
  listGroupTasks: jest.fn(),
  updateTaskStatus: jest.fn(),
}));

jest.mock("../api/members", () => ({
  listGroupMembers: jest.fn(),
}));

const { listGroupTasks } = require("../api/tasks");
const { listGroupMembers } = require("../api/members");

const taskResponse = {
  results: [
    {
      id: 10,
      title: "Draft report",
      description: "Finish draft",
      status: "todo",
      due_date: null,
      assigned_to_username: "alex",
    },
  ],
};

describe("TaskBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listGroupTasks.mockResolvedValue(taskResponse);
    listGroupMembers.mockResolvedValue([{ user: { id: 3, username: "alex" } }]);
  });

  test("embedded mode hides back link and shows reset filters", async () => {
    render(<TaskBoard embedded />);

    await waitFor(() => expect(screen.getByText("Task Board")).toBeInTheDocument());

    expect(screen.queryByText("Back to Workspace")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apply Filters" })).not.toBeInTheDocument();
  });

  test("changing status filter auto-loads tasks without apply button", async () => {
    render(<TaskBoard embedded />);

    await waitFor(() => expect(listGroupTasks).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByText("Loading task board...")).not.toBeInTheDocument()
    );

    const statusSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(statusSelect, { target: { value: "todo" } });

    await waitFor(() => {
      expect(listGroupTasks).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ status: "todo" })
      );
    });
  });
});
