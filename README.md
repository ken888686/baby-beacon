# 👶 Baby Beacon

**Baby Beacon** is a smart baby monitoring and health tracking assistant designed for tired parents. It
provides a soft, intuitive interface to track daily activities, growth metrics, and health records for multiple babies.

## ✨ Features

- **Soft UI Design**: A gentle, pastel-colored interface optimized for night-time use and sleep-deprived eyes.
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

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL (Custom client output)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Runtime**: [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A PostgreSQL database instance.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AaronTu/baby-beacon.git
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
   ```

4. **Initialize Database & Seed Data:**

   ```bash
   bun prisma migrate dev
   # To re-seed data manually:
   bun prisma db seed
   ```

5. **Run the Development Server:**

   ```bash
   bun dev
   ```

### 🧪 Testing

The project uses Vitest and React Testing Library for comprehensive testing.

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## 📂 Project Structure

- `app/`: Next.js App Router.
  - `actions/`: Server Actions (Business logic & DB interactions).
  - `components/`: UI components.
- `__tests__/`: Comprehensive test suite.
  - `actions/`: Unit tests for Server Actions.
  - `components/`: Component & Integration tests.
- `components/ui/`: Reusable shadcn/ui components.
- `prisma/`:
  - `schema.prisma`: Multi-model schema for baby tracking.
  - `seed.ts`: Mock data for development.
- `lib/`: Prisma client instance and utility functions.
- `public/`: Static assets.

## 📄 License

This project is private and for personal use.
