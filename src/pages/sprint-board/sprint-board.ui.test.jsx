import { render, screen, fireEvent } from "@testing-library/react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { BoardFilters } from "./sprint-board.ui.jsx"

describe("BoardFilters component", () => {
  const defaultFilters = { type: "all", priority: "all", assignee: "all" }

  it("renders without crashing when tasks prop is undefined", () => {
    render(
      <BoardFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        // tasks omitted intentionally
      />,
    )
    expect(screen.getByText(/Filters:/i)).toBeInTheDocument()
    expect(screen.getByText(/All Types/i)).toBeInTheDocument()
  })

  it("shows unique assignees derived from tasks if projectMembers not provided", () => {
    const tasks = [
      { id: "1", assignee: { id: 10, name: "Alice" } },
      { id: "2", assignee: { id: 11, name: "Bob" } },
      { id: "3", assignee: { id: 10, name: "Alice" } },
    ]
    render(
      <BoardFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        tasks={tasks}
      />,
    )

    // open assignee select menu
    fireEvent.click(screen.getByText(/All Members/i))
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("calls onChange when a filter option is selected", () => {
    const handleChange = vi.fn()
    render(
      <BoardFilters
        filters={defaultFilters}
        onChange={handleChange}
        tasks={[]}
      />,
    )

    // select priority filter
    fireEvent.click(screen.getByText(/All Priorities/i))
    fireEvent.click(screen.getByText(/High/i))
    expect(handleChange).toHaveBeenCalledWith({
      ...defaultFilters,
      priority: "high",
    })
  })
})

// The file currently exports default only? Actually SprintBoardUI likely exported by default. We'll adjust.

// We'll modify sprint-board.ui.jsx to export BoardFilters as named export for testing.
