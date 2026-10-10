import { describe, it, expect } from "vitest";
import { parsePollsFromClipboard } from "@/components/polls/main/ImportFromClipboardButton";

function baseItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    question: "Best hero?",
    guild_id: 1,
    choices: ["Iron Man", "Thor"],
    tag: 5,
    ...overrides,
  };
}

function parseItems(items: unknown[]) {
  return parsePollsFromClipboard(JSON.stringify(items));
}

describe("parsePollsFromClipboard time alias", () => {
  it("time-only item parses time into start_time as a Date of the same instant (string ISO form)", () => {
    const { polls, errors } = parseItems([
      baseItem({ time: "2026-08-01T12:00:00Z" }),
    ]);
    expect(errors).toEqual([]);
    expect(polls).toHaveLength(1);
    expect(polls[0].start_time).toBeInstanceOf(Date);
    expect(polls[0].start_time?.getTime()).toBe(
      Date.parse("2026-08-01T12:00:00Z"),
    );
  });

  it("time-only item parses time into start_time as a Date of the same instant (epoch number form)", () => {
    const epoch = Date.parse("2026-08-01T12:00:00Z");
    const { polls, errors } = parseItems([baseItem({ time: epoch })]);
    expect(errors).toEqual([]);
    expect(polls).toHaveLength(1);
    expect(polls[0].start_time).toBeInstanceOf(Date);
    expect(polls[0].start_time?.getTime()).toBe(epoch);
  });

  it("both start_time and time present: start_time wins", () => {
    const { polls, errors } = parseItems([
      baseItem({
        start_time: "2026-08-02T12:00:00Z",
        time: "2026-08-01T12:00:00Z",
      }),
    ]);
    expect(errors).toEqual([]);
    expect(polls[0].start_time?.getTime()).toBe(
      Date.parse("2026-08-02T12:00:00Z"),
    );
  });

  it("invalid start_time with valid time: error names start_time, no silent fallback to time", () => {
    const { polls, errors } = parseItems([
      baseItem({
        start_time: "not-a-date",
        time: "2026-08-01T12:00:00Z",
      }),
    ]);
    expect(errors).toEqual(["item 1: invalid start_time"]);
    expect(polls[0].start_time).toBeUndefined();
  });

  it("neither start_time nor time: start_time is undefined with no error", () => {
    const { polls, errors } = parseItems([baseItem()]);
    expect(errors).toEqual([]);
    expect(polls[0].start_time).toBeUndefined();
  });
});
