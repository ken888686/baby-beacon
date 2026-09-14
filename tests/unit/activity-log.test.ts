import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildActivityLogData,
  buildActivityLogUpdate,
  getDiaperSummary,
  getFeedSummary,
  getGrowthSummary,
  getHealthSummary,
  getSleepSummary,
} from "../../lib/activity-log";

describe("activity log summaries", () => {
  it("formats a completed sleep with duration and quality", () => {
    const start = new Date("2026-01-01T10:00:00.000Z");
    const end = new Date("2026-01-01T11:30:00.000Z");

    assert.deepEqual(getSleepSummary(start, end, "Deep"), {
      title: "Sleep",
      details: "90m (Deep)",
    });
  });

  it("formats feed and diaper summaries", () => {
    assert.deepEqual(
      getFeedSummary("BOTTLE_FORMULA", 120, null, null, "Before nap"),
      {
        title: "Bottle (Formula)",
        details: "120ml, Before nap",
      },
    );
    assert.deepEqual(getDiaperSummary("WET", null, null, "Overnight"), {
      title: "Diaper Change",
      details: "Overnight",
    });
  });

  it("formats health and growth summaries", () => {
    assert.deepEqual(getHealthSummary({ type: "TEMPERATURE", value: 37.5 }), {
      title: "Temperature",
      details: "37.5°C",
    });
    assert.deepEqual(
      getGrowthSummary({ height: 70, weight: 8.2, headCircumference: null }),
      { title: "Growth Check", details: "H: 70cm, W: 8.2kg" },
    );
  });
});

describe("activity log payload builders", () => {
  it("builds consistent create and update payloads", () => {
    const summary = { title: "Sleep", details: "45m" };
    const recordedAt = new Date("2026-01-01T10:00:00.000Z");

    assert.deepEqual(
      buildActivityLogData({
        babyId: "baby-1",
        category: "SLEEP",
        recordedAt,
        summary,
      }),
      {
        babyId: "baby-1",
        category: "SLEEP",
        title: "Sleep",
        details: "45m",
        recordedAt,
      },
    );
    assert.deepEqual(buildActivityLogUpdate({ recordedAt, summary }), {
      title: "Sleep",
      details: "45m",
      recordedAt,
    });
  });
});
