import type { Meta, Poll } from "@/types/jocasta";
import { axiosPollsInstance } from "../axios";
import type { AxiosResponse } from "axios";
import config from "@/app/config/config";
import { serializeBigIntFields } from "@/utils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api/polls");

interface GetPollsParams {
  guildId?: string | bigint;
  published?: boolean;
  tag?: number;
  user?: PollFilterUser;
  search?: string;

  // Ordering parameters
  order?: string;
  orderDir?: "asc" | "desc";
  seed?: number;

  page?: number;
  limit?: number;

  signal?: AbortSignal;
}

export interface PollFilterUser {
  userId: bigint;
  notVoted?: boolean;
}

export const getPolls = async ({
  guildId = config.guildId,
  published = true,
  tag,
  user,
  search,
  order,
  orderDir,
  seed,
  page = 1,
  limit = 10,
  signal,
}: GetPollsParams): Promise<{ polls: Poll[]; meta: Meta }> => {
  try {
    const params = {
      guildId: guildId.toString(),
      published: published,
      tag: tag,
      userId: user ? user.userId.toString() : undefined,
      notVoted: user ? user?.notVoted : undefined,
      search: search,
      order: order,
      orderDir: orderDir,
      seed: seed,
      page: page,
      limit: limit,
    };

    const response: AxiosResponse<{ data: Poll[]; meta: Meta }> =
      await axiosPollsInstance.get("/polls", { params: params, signal });

    return { polls: response.data.data, meta: response.data.meta };
  } catch (error) {
    logger.error("Error fetching polls:", error);
    throw error;
  }
};

export const getPollById = async (pollId: string): Promise<Poll> => {
  try {
    const response: AxiosResponse<Poll> = await axiosPollsInstance.get(
      `/polls/${pollId ?? 0}`
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching poll:", error);
    throw error;
  }
};

/**
 * Whitelist pick of editable fields for POST /polls/update.
 * The API enforces a strict field matrix (assertNoRestrictedUpdateFields):
 * sending `published`, `guild_id`, `num`, `message_id`,
 * `crosspost_message_ids`, or `fallback` → 400. This pick approach is
 * immune to future schema drift and avoids the time/start_time conflict
 * (the API serializer returns both; we send only `time` and `end_time`).
 *
 * `end_time` is delta-omitted: when neither the draft nor the original
 * poll has one, the key is left out entirely so a bot-side `/end` that
 * lands between fetch and save isn't clobbered by a stale null. It is
 * still sent when clearing (original had one, draft doesn't).
 */
export const toUpdatePayload = (poll: Poll, originalPoll?: Poll) => ({
  id: poll.id,
  question: poll.question,
  description: poll.description,
  image: poll.image,
  thread_question: poll.thread_question,
  choices: poll.choices,
  tag: poll.tag,
  time: poll.time instanceof Date ? poll.time.toISOString() : poll.time,
  ...(poll.end_time != null || originalPoll?.end_time != null
    ? {
        end_time:
          poll.end_time instanceof Date
            ? poll.end_time.toISOString()
            : poll.end_time,
      }
    : {}),
  show_question: poll.show_question,
  show_options: poll.show_options,
  show_voting: poll.show_voting,
});

/**
 * Whitelist pick of creatable fields for POST /polls/create.
 * The API tolerates extra fields today (strips server-side) but the
 * documented intent is fail-safe-against-drift; sending only what the
 * endpoint accepts is future-proof.
 */
export const toCreatePayload = (poll: Omit<Poll, "id">) => ({
  question: poll.question,
  choices: poll.choices,
  tag: poll.tag,
  guild_id: poll.guild_id,
  time: poll.time instanceof Date ? poll.time.toISOString() : poll.time,
  end_time:
    poll.end_time instanceof Date ? poll.end_time.toISOString() : poll.end_time,
  image: poll.image,
  description: poll.description,
  thread_question: poll.thread_question,
  show_question: poll.show_question,
  show_options: poll.show_options,
  show_voting: poll.show_voting,
});

/**
 * Create new polls
 */
export const createPolls = async (
  polls: Omit<Poll, "id">[]
): Promise<Poll[]> => {
  try {
    const payload = polls.map((poll) => serializeBigIntFields(toCreatePayload(poll)));
    const response: AxiosResponse<{ message: string; polls: Poll[] }> =
      await axiosPollsInstance.post("/polls/create", payload);
    return response.data.polls;
  } catch (error) {
    logger.error("Error creating polls:", error);
    throw error;
  }
};

/**
 * Update existing polls
 *
 * `originalPollsById` enables the end_time delta omission in
 * `toUpdatePayload` (see its doc comment).
 */
export const updatePolls = async (
  polls: Poll[],
  originalPollsById?: Map<number, Poll>
): Promise<Poll[]> => {
  try {
    const payload = polls.map((poll) =>
      serializeBigIntFields(
        toUpdatePayload(poll, originalPollsById?.get(poll.id))
      )
    );
    const response: AxiosResponse<{ message: string; polls: Poll[] }> =
      await axiosPollsInstance.post("/polls/update", payload);
    return response.data.polls;
  } catch (error) {
    logger.error("Error updating polls:", error);
    throw error;
  }
};

/**
 * Delete polls by IDs
 */
export const deletePolls = async (pollIds: string[]): Promise<void> => {
  try {
    await axiosPollsInstance.post("/polls/delete", { pollIds });
  } catch (error) {
    logger.error("Error deleting polls:", error);
    throw error;
  }
};
