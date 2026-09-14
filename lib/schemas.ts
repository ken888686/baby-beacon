import { z } from "zod";

export const uuidSchema = z.uuid();

// Enums
export const GenderEnum = z.enum(["MALE", "FEMALE"]);
export const FeedTypeEnum = z.enum([
  "BREAST",
  "BOTTLE_FORMULA",
  "BOTTLE_BREAST_MILK",
  "SOLID",
]);
export const SideEnum = z.enum(["LEFT", "RIGHT", "BOTH"]);
export const DiaperTypeEnum = z.enum(["WET", "DIRTY", "MIXED", "DRY"]);
export const HealthTypeEnum = z.enum([
  "TEMPERATURE",
  "SYMPTOM",
  "MEDICINE",
  "VACCINE",
  "OTHER",
]);

// Baby Schemas
export const createBabySchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.date(),
  gender: GenderEnum,
  photoUrl: z.string().optional(),
});

export const updateBabySchema = z.object({
  name: z.string().min(1).optional(),
  birthDate: z.date().optional(),
  gender: GenderEnum.optional(),
  photoUrl: z.string().optional(),
});

// Sleep Schemas
export const logSleepSchema = z.object({
  babyId: uuidSchema,
  startTime: z.date(),
  endTime: z.date().optional(),
  quality: z.string().optional(),
});

// Feed Schemas
export const logFeedSchema = z.object({
  babyId: uuidSchema,
  type: FeedTypeEnum,
  amount: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  side: SideEnum.nullable().optional(),
  note: z.string().optional(),
  recordedAt: z.date().optional(),
});

// Diaper Schemas
export const logDiaperSchema = z.object({
  babyId: uuidSchema,
  type: DiaperTypeEnum,
  color: z.string().nullable().optional(),
  texture: z.string().nullable().optional(),
  note: z.string().optional(),
  recordedAt: z.date().optional(),
});

// Health Schemas
export const logHealthSchema = z.object({
  babyId: uuidSchema,
  type: HealthTypeEnum,
  value: z.number().optional(),
  description: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  note: z.string().optional(),
  recordedAt: z.date().optional(),
});

// Growth Schemas
export const logGrowthSchema = z.object({
  babyId: uuidSchema,
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  headCircumference: z.number().positive().optional(),
  note: z.string().optional(),
  recordedAt: z.date().optional(),
});
