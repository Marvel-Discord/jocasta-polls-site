import { describe, it, expect } from "vitest";
import type { Poll } from "@/types/jocasta";
import { validatePoll } from "@/utils/polls/validation";

function basePoll(overrides: Partial<Poll> = {}): Poll {
  return {
    id: 1,
    question: "Best hero?",
    published: false,
    active: false,
    guild_id: BigInt(1),
    choices: ["Iron Man", "Thor"],
    votes: [],
    total_votes: 0,
    start_time: new Date("2026-08-01T12:00:00Z"),
    end_time: null,
    num: null,
    message_id: null,
    crosspost_message_ids: [],
    tag: 5,
    image: null,
    description: null,
    thread_question: null,
    show_question: true,
    show_options: true,
    show_voting: true,
    fallback: false,
    ...overrides,
  };
}

describe("validatePoll end_time", () => {
  it("valid with no end_time", () => {
    expect(validatePoll(basePoll()).isValid).toBe(true);
  });

  it("valid with start and later end", () => {
    const poll = basePoll({
      start_time: new Date("2026-08-01T12:00:00Z"),
      end_time: new Date("2026-08-02T12:00:00Z"),
    });
    expect(validatePoll(poll).isValid).toBe(true);
  });

  it("invalid when end_time is set but start_time is null", () => {
    const poll = basePoll({
      start_time: null,
      end_time: new Date("2026-08-02T12:00:00Z"),
    });
    const result = validatePoll(poll);
    expect(result.isValid).toBe(false);
    expect(result.errors.get(poll)).toContain("End time requires a start date");
  });

  it("invalid when end_time is before start_time", () => {
    const poll = basePoll({
      start_time: new Date("2026-08-02T12:00:00Z"),
      end_time: new Date("2026-08-01T12:00:00Z"),
    });
    const result = validatePoll(poll);
    expect(result.isValid).toBe(false);
    expect(result.errors.get(poll)).toContain(
      "End time must be after the start date"
    );
  });

  it("invalid when end_time equals start_time (API check is strict start < end)", () => {
    const t = new Date("2026-08-01T12:00:00Z");
    const poll = basePoll({ start_time: t, end_time: new Date(t) });
    const result = validatePoll(poll);
    expect(result.isValid).toBe(false);
    expect(result.errors.get(poll)).toContain(
      "End time must be after the start date"
    );
  });

  it("accepts ISO string dates from API deserialization", () => {
    const poll = basePoll({
      start_time: "2026-08-01T12:00:00Z" as unknown as Date,
      end_time: "2026-08-02T12:00:00Z" as unknown as Date,
    });
    expect(validatePoll(poll).isValid).toBe(true);
  });

  it("invalid when end_time is an unparseable string (NaN guard)", () => {
    const poll = basePoll({
      start_time: new Date("2026-08-01T12:00:00Z"),
      end_time: "not a date" as unknown as Date,
    });
    const result = validatePoll(poll);
    expect(result.isValid).toBe(false);
    expect(result.errors.get(poll)).toContain("End time is invalid");
  });

  it("end time with an unparseable start reports the start-date error", () => {
    const poll = basePoll({
      start_time: "garbage" as unknown as Date,
      end_time: new Date("2026-08-02T12:00:00Z"),
    });
    const result = validatePoll(poll);
    expect(result.isValid).toBe(false);
    expect(result.errors.get(poll)).toContain(
      "End time requires a start date"
    );
  });
});
