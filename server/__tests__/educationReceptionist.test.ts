import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OpenAI from "openai";
import {
  clearReceptionistCache,
  runKeepItHedgePassOnly,
  runQualityCheckOnly,
  runReceptionist,
} from "../educationReceptionist";

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  },
}));

const nodeContext = {
  label: "Chain link",
  shape: "up-triangle",
  layer: "engine",
  state: "clean",
  criticality: "essential",
  role: "Verifies each receipt points to the previous one so order cannot be quietly rearranged.",
  technology: "SHA-256 hashing and ordered rows in Postgres",
  anomalies: [] as string[],
};

describe("education Receptionist", () => {
  beforeEach(() => {
    clearReceptionistCache();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content:
              "This step checks that each saved record points to the one before it, like pages in a numbered notebook, so you can trust nothing was quietly reordered.",
          },
        },
      ],
    });
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it("returns non-empty text for all four modes with valid node context", async () => {
    for (const mode of ["explain", "other-ways", "suggestions", "keep-it"] as const) {
      clearReceptionistCache();
      vi.clearAllMocks();
      if (mode === "other-ways") {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: "Some systems use a ledger; others use a simple list." } }],
        });
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: "Some systems use a ledger; others use a simple list." } }],
        });
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  simpler: "A plain numbered list.",
                  more_scalable: "A dedicated event store.",
                  why_keep_it: "Hashes are enough for Debrief-sized use.",
                }),
              },
            },
          ],
        });
      } else if (mode === "keep-it") {
        mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "Answer for keep-it." } }] });
        mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "Answer for keep-it." } }] });
        mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: "Answer for keep-it." } }] });
      } else {
        mockCreate.mockResolvedValue({
          choices: [{ message: { content: `Answer for ${mode}.` } }],
        });
      }
      const out = await runReceptionist({
        nodeId: "chain-link",
        mode,
        nodeContext:
          mode === "suggestions"
            ? { ...nodeContext, anomalies: ["Synthetic test anomaly for LLM path"] }
            : nodeContext,
        runId: "99",
      });
      expect(out.ok).toBe(true);
      expect((out.text ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  it("suggestions with empty anomalies returns exact copy and does not call the LLM", async () => {
    clearReceptionistCache();
    vi.clearAllMocks();
    const exact = "Nothing to change here. This is working as it should.";
    const out = await runReceptionist({
      nodeId: "chain-link",
      mode: "suggestions",
      nodeContext: { ...nodeContext, anomalies: [] },
      runId: "sug-1",
    });
    expect(out.ok).toBe(true);
    expect(out.text).toBe(exact);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("keep-it hedge pass removes hedging when the model returns direct wording", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "This component is working. You can leave this alone and stop worrying about it.",
          },
        },
      ],
    });
    const client = new OpenAI({ apiKey: "unit" });
    const out = await runKeepItHedgePassOnly(client, "This seems to be working well for your use case.");
    expect(out.toLowerCase()).not.toContain("seems");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("runReceptionist replaces a jargon-only draft after the quality pass", async () => {
    clearReceptionistCache();
    vi.clearAllMocks();
    mockCreate
      .mockResolvedValueOnce({ choices: [{ message: { content: "Just use the API for storage." } }] })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                "Just use an API (application programming interface — a structured way programs share work) for storage.",
            },
          },
        ],
      });
    const out = await runReceptionist({
      nodeId: "x",
      mode: "explain",
      nodeContext,
      runId: "qc-run",
    });
    expect(out.ok).toBe(true);
    expect(out.text?.toLowerCase()).toContain("application programming");
  });

  it("quality check returns rewritten text that defines API when the draft used it without explanation", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content:
              "You call an API (an application programming interface, which is a structured doorway for one program to ask another for work). It stores your data.",
          },
        },
      ],
    });
    const client = new OpenAI({ apiKey: "unit" });
    const out = await runQualityCheckOnly(client, "You call the API. It stores data.", "explain");
    expect(out.toLowerCase()).toMatch(/application programming interface/);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
