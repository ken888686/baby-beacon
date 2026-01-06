// src/db/schema.ts
import { defineRelations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// 1. 使用者 (User)
export const users = pgTable.withRLS("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role", { enum: ["USER", "ADMIN"] }).default("USER"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. 地點類別 (Category)
export const categories = pgTable.withRLS("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(), // e.g., 'medical'
  name: text("name").notNull(), // e.g., '醫療急救'
  iconName: text("icon_name"),
});

// 3. 設施標籤 (Facility)
export const facilities = pgTable.withRLS("facilities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: text("code").notNull().unique(), // e.g., 'nursing_room'
  label: text("label").notNull(), // e.g., '哺乳室'
});

// 4. 地點 (Spot)
export const spots = pgTable.withRLS("spots", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  lat: doublePrecision("lat").notNull(), // 經緯度使用 double
  lng: doublePrecision("lng").notNull(),
  url: text("url"),
  categoryId: integer("category_id").references(() => categories.id), // FK
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. [多對多中介表] 地點-設施 (Spot <-> Facility)
export const spotsToFacilities = pgTable.withRLS(
  "spots_to_facilities",
  {
    spotId: integer("spot_id")
      .notNull()
      .references(() => spots.id),
    facilityId: integer("facility_id")
      .notNull()
      .references(() => facilities.id),
  },
  (t) => [
    primaryKey({ columns: [t.spotId, t.facilityId] }),
    index("spots_to_facilities_spot_id_idx").on(t.spotId),
    index("spots_to_facilities_facility_id_idx").on(t.facilityId),
    index("spots_to_facilities_composite_idx").on(t.spotId, t.facilityId),
  ],
);

// --- 關聯定義 (Relations) ---
export const spotRelations = defineRelations(
  { spots, facilities, spotsToFacilities },
  (r) => ({
    spots: {
      facilities: r.many.facilities({
        from: r.spots.id.through(r.spotsToFacilities.spotId),
        to: r.facilities.id.through(r.spotsToFacilities.facilityId),
      }),
    },
    facilities: {
      spots: r.many.spots(),
    },
  }),
);
