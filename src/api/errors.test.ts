import { describe, expect, it } from "vitest";

import { apiErrorMessage } from "@/api/errors";

describe("apiErrorMessage", () => {
  it("extracts the API's message from an axios error response body", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          message: "Cannot change the number of choices for a published poll",
        },
      },
    };
    expect(
      apiErrorMessage(error, "Failed to save changes"),
    ).toBe("Cannot change the number of choices for a published poll");
  });

  it("falls back to the error's own message when the response has none", () => {
    const error = Object.assign(
      new Error("Request failed with status code 400"),
      { isAxiosError: true, response: { data: {} } },
    );
    expect(apiErrorMessage(error, "Failed to save changes")).toBe(
      "Request failed with status code 400",
    );
  });

  it("falls back through a plain Error's message", () => {
    expect(apiErrorMessage(new Error("network hiccup"), "fallback")).toBe(
      "network hiccup",
    );
  });

  it("returns the fallback for non-error values", () => {
    expect(apiErrorMessage("mystery", "fallback")).toBe("fallback");
    expect(apiErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(apiErrorMessage(null, "fallback")).toBe("fallback");
  });
});
