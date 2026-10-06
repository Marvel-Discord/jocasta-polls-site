import { describe, it, expect } from "vitest";
import type { Poll } from "@/types/jocasta";
import { toCreatePayload, toUpdatePayload } from "@/api/polls/polls";

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
    time: new Date("2026-08-01T12:00:00Z"),
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

describe("toUpdatePayload", () => {
  it("serializes a Date end_time to an ISO string", () => {
    const poll = basePoll({
      end_time: new Date("2026-08-02T12:00:00Z"),
    });
    expect(toUpdatePayload(poll).end_time).toBe("2026-08-02T12:00:00.000Z");
  });

  it("omits a null end_time when no original is provided (safer default)", () => {
    expect(toUpdatePayload(basePoll())).not.toHaveProperty("end_time");
  });

  it("passes an ISO string end_time through unchanged", () => {
    const poll = basePoll({
      end_time: "2026-08-02T12:00:00Z" as unknown as Date,
    });
    expect(toUpdatePayload(poll).end_time).toBe("2026-08-02T12:00:00Z");
  });

  it("omits end_time when the original poll's end_time was also null", () => {
    const poll = basePoll();
    const original = basePoll();
    expect(toUpdatePayload(poll, original)).not.toHaveProperty("end_time");
  });

  it("sends null (clearing) when the original had an end_time", () => {
    const poll = basePoll();
    const original = basePoll({
      end_time: new Date("2026-08-02T12:00:00Z"),
    });
    expect(toUpdatePayload(poll, original).end_time).toBeNull();
  });

  it("sends the draft end_time when the original was null", () => {
    const poll = basePoll({
      end_time: new Date("2026-08-03T12:00:00Z"),
    });
    const original = basePoll();
    expect(toUpdatePayload(poll, original).end_time).toBe(
      "2026-08-03T12:00:00.000Z"
    );
  });

  it("treats an ISO-string original end_time as set (API runtime shape)", () => {
    const poll = basePoll();
    const original = basePoll({
      end_time: "2026-08-02T12:00:00Z" as unknown as Date,
    });
    expect(toUpdatePayload(poll, original).end_time).toBeNull();
  });
});

describe("toCreatePayload", () => {
  it("serializes a Date end_time to an ISO string", () => {
    const poll = basePoll({
      end_time: new Date("2026-08-02T12:00:00Z"),
    });
    const { end_time, ...rest } = toCreatePayload(poll);
    expect(end_time).toBe("2026-08-02T12:00:00.000Z");
    expect(rest).not.toHaveProperty("id");
  });

  it("passes a null end_time through as null", () => {
    expect(toCreatePayload(basePoll()).end_time).toBeNull();
  });
});
