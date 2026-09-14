# 👶 Baby Beacon

**Baby Beacon** is a mobile-first baby care and health tracking assistant designed for tired parents. It
provides a calm, accessible interface for tracking daily activities, growth metrics, and health records across multiple babies.

## ✨ Features

- **Organic Biophilic UI**: A calm green visual system with accessible contrast, touch-friendly controls, and reduced-motion support.
- **Secure Authentication**: Built-in Google social login powered by Better Auth.
- **Multi-Baby Management**: Easily switch between different babies using the built-in Baby Switcher.
- **Unified Activity Timeline**: A consolidated view of all baby activities, sorted by time with intuitive category icons.
- **Activity Tracking**:
  - **Sleep**: Track nap durations and sleep quality.
  - **Feeding**: Record breastfeeding (left/right side), bottle feeding (formula/breast milk), and solid food intake.
  - **Diaper**: Monitor wet, dirty, or mixed diapers with texture and color notes.
- **Health Monitoring**: Log temperature, symptoms, medications, and vaccinations.
- **Growth Tracking**: Record height, weight, and head circumference with historical indexing.
- **Mobile First**: Designed specifically for one-handed operation on mobile devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Runtime**: [React 19](https://react.dev/) with Server Actions
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database**: [Prisma 7](https://www.prisma.io/) with PostgreSQL (custom client output)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: Node.js test runner with TypeScript support via [tsx](https://tsx.is/)
- **Runtime**: [Bun](https://bun.sh/), with [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A PostgreSQL database instance.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ken888686/baby-beacon.git
   cd baby-beacon
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/baby-beacon"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   BETTER_AUTH_SECRET="your-auth-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Initialize Database & Seed Data:**

   ```bash
   bun prisma migrate dev
   # To re-seed data manually:
   bun prisma db seed
   ```

   If the database was created before migrations were added and already matches
   the current schema, mark the baseline as applied before running the data
   backfill:

   ```bash
   bun prisma migrate resolve --applied 20260914160000_init
   bun prisma migrate deploy
   bun run db:backfill-activity
   ```

   Only mark the baseline as applied when the existing database already matches
   the current Prisma schema. The backfill is idempotent and only creates missing
   `ActivityLog` records.

   Vercel production deployments run `prisma migrate deploy` automatically before
   the Next.js build through `vercel.json`. Make sure the Production environment's
   `DATABASE_URL` points to the intended database. To apply migrations manually:

   ```bash
   npx prisma migrate deploy
   ```

   If an existing database has the baseline marked as applied but is missing a
   table from that baseline, create a forward migration for the missing schema
   before deploying. `prisma migrate deploy` does not re-run migrations that are
   already recorded as applied.

5. **Run the Development Server:**

   ```bash
   bun dev
   ```

### 🧪 Testing

Run the unit tests with:

```bash
bun run test
```

The current unit coverage focuses on ActivityLog summaries and payload builders,
which are shared by all record Actions and the database backfill command.

## 📂 Project Structure

- `app/`: Next.js App Router.
  - `actions/`: Server Actions (Business logic & DB interactions).
  - `components/`: UI components.
- `tests/unit/`: Pure unit tests for shared domain helpers.
- `components/ui/`: Reusable shadcn/ui components.
- `prisma/`:
  - `schema.prisma`: Multi-model schema for baby tracking.
  - `migrations/`: Versioned PostgreSQL schema and data constraints.
  - `seed.ts`: Mock data for development.
- `scripts/`: Operational data migration scripts.
- `lib/`: Prisma client instance and utility functions.
- `public/`: Static assets.

## 📄 License

This project is private and for personal use.
