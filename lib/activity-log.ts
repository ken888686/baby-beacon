import {
  DiaperType,
  FeedType,
  HealthType,
  type ActivityCategory,
  type Side,
} from "@/app/generated/prisma/client";

export type ActivitySummary = {
  title: string;
  details: string;
};

export function getSleepSummary(
  startTime: Date,
  endTime?: Date | null,
  quality?: string | null,
): ActivitySummary {
  if (!endTime) return { title: "Sleeping", details: "Sleeping..." };

  const duration = `${Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60),
  )}m`;
  const details = `${duration} ${quality ? `(${quality})` : ""}`.trim();
  return { title: "Sleep", details };
}

export function getFeedSummary(
  type: FeedType,
  amount?: number | null,
  duration?: number | null,
  side?: Side | null,
  note?: string | null,
): ActivitySummary {
  switch (type) {
    case FeedType.BREAST:
      return { title: "Breast Feed", details: `${side} side, ${duration}m` };
    case FeedType.BOTTLE_FORMULA:
      return {
        title: "Bottle (Formula)",
        details: [amount ? `${amount}ml` : null, note]
          .filter(Boolean)
          .join(", "),
      };
    case FeedType.BOTTLE_BREAST_MILK:
      return { title: "Bottle (Breast Milk)", details: `${amount}ml` };
    case FeedType.SOLID:
      return { title: "Solid Food", details: note || "" };
  }
}

export function getDiaperSummary(
  type: DiaperType,
  color?: string | null,
  texture?: string | null,
  note?: string | null,
): ActivitySummary {
  return {
    title: "Diaper Change",
    details:
      type === DiaperType.WET || type === DiaperType.DRY
        ? note || ""
        : [color, texture, note].filter(Boolean).join(", "),
  };
}

export function getHealthSummary(input: {
  type: HealthType;
  value?: number | null;
  description?: string | null;
  symptoms?: string[];
  note?: string | null;
}): ActivitySummary {
  let title = "Health Log";
  let details = input.description || input.note || "";

  switch (input.type) {
    case HealthType.TEMPERATURE:
      title = "Temperature";
      details = `${input.value}°C`;
      break;
    case HealthType.VACCINE:
      title = "Vaccine";
      break;
    case HealthType.MEDICINE:
      title = "Medicine";
      break;
    case HealthType.SYMPTOM:
      title = "Symptom";
      details = input.symptoms?.join(", ") || "";
      break;
  }

  return { title, details };
}

export function getGrowthSummary(input: {
  height?: number | null;
  weight?: number | null;
  headCircumference?: number | null;
}): ActivitySummary {
  return {
    title: "Growth Check",
    details: [
      input.height ? `H: ${input.height}cm` : null,
      input.weight ? `W: ${input.weight}kg` : null,
      input.headCircumference ? `HC: ${input.headCircumference}cm` : null,
    ]
      .filter(Boolean)
      .join(", "),
  };
}

export function buildActivityLogData(input: {
  babyId: string;
  category: ActivityCategory;
  recordedAt: Date;
  summary: ActivitySummary;
}) {
  return {
    babyId: input.babyId,
    category: input.category,
    title: input.summary.title,
    details: input.summary.details,
    recordedAt: input.recordedAt,
  };
}

export function buildActivityLogUpdate(input: {
  recordedAt: Date;
  summary: ActivitySummary;
}) {
  return {
    title: input.summary.title,
    details: input.summary.details,
    recordedAt: input.recordedAt,
  };
}
