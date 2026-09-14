import {
  DiaperLog,
  DiaperType,
  FeedLog,
  FeedType,
  GrowthRecord,
  HealthLog,
  HealthType,
  SleepLog,
} from "@/app/generated/prisma/client";

export type TimelineCategory = "SLEEP" | "FEED" | "DIAPER" | "HEALTH" | "GROWTH";

export type TimelineItem = {
  id: string;
  category: TimelineCategory;
  title: string;
  details: string;
  recordedAt: Date;
  metadata?: SleepLog | FeedLog | DiaperLog | HealthLog | GrowthRecord;
};

type LegacyRecord = SleepLog | FeedLog | DiaperLog | HealthLog | GrowthRecord;

export function mapLegacyTimelineItem(
  category: TimelineCategory,
  log: LegacyRecord,
): TimelineItem {
  switch (category) {
    case "SLEEP": {
      const sleep = log as SleepLog;
      const duration = sleep.endTime
        ? `${Math.round((sleep.endTime.getTime() - sleep.startTime.getTime()) / (1000 * 60))}m`
        : "Sleeping...";
      return {
        id: sleep.id,
        category,
        title: sleep.endTime ? "Sleep" : "Sleeping",
        details: `${duration} ${sleep.quality ? `(${sleep.quality})` : ""}`.trim(),
        recordedAt: sleep.startTime,
        metadata: sleep,
      };
    }
    case "FEED": {
      const feed = log as FeedLog;
      let title = "Feed";
      let details = "";

      switch (feed.type) {
        case FeedType.BREAST:
          title = "Breast Feed";
          details = `${feed.side ?? "Both"} side, ${feed.duration ?? 0}m`;
          break;
        case FeedType.BOTTLE_FORMULA:
          title = "Bottle (Formula)";
          details = [feed.amount ? `${feed.amount}ml` : null, feed.note]
            .filter(Boolean)
            .join(", ");
          break;
        case FeedType.BOTTLE_BREAST_MILK:
          title = "Bottle (Breast Milk)";
          details = feed.amount ? `${feed.amount}ml` : "";
          break;
        case FeedType.SOLID:
          title = "Solid Food";
          details = feed.note || "";
          break;
      }

      return {
        id: feed.id,
        category,
        title,
        details,
        recordedAt: feed.recordedAt,
        metadata: feed,
      };
    }
    case "DIAPER": {
      const diaper = log as DiaperLog;
      const details =
        diaper.type === DiaperType.WET || diaper.type === DiaperType.DRY
          ? diaper.note || ""
          : [diaper.color, diaper.texture, diaper.note]
              .filter(Boolean)
              .join(", ");
      return {
        id: diaper.id,
        category,
        title: "Diaper Change",
        details,
        recordedAt: diaper.recordedAt,
        metadata: diaper,
      };
    }
    case "HEALTH": {
      const health = log as HealthLog;
      let title = "Health Log";
      let details = health.description || health.note || "";

      switch (health.type) {
        case HealthType.TEMPERATURE:
          title = "Temperature";
          details = health.value === null ? "" : `${health.value}°C`;
          break;
        case HealthType.VACCINE:
          title = "Vaccine";
          break;
        case HealthType.MEDICINE:
          title = "Medicine";
          break;
        case HealthType.SYMPTOM:
          title = "Symptom";
          details = health.symptoms.join(", ");
          break;
      }

      return {
        id: health.id,
        category,
        title,
        details,
        recordedAt: health.recordedAt,
        metadata: health,
      };
    }
    case "GROWTH": {
      const growth = log as GrowthRecord;
      const details = [
        growth.height ? `H: ${growth.height}cm` : null,
        growth.weight ? `W: ${growth.weight}kg` : null,
        growth.headCircumference ? `HC: ${growth.headCircumference}cm` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return {
        id: growth.id,
        category,
        title: "Growth Check",
        details,
        recordedAt: growth.recordedAt,
        metadata: growth,
      };
    }
  }
}
