# 👶 Baby Beacon

**Baby Beacon** is a smart baby monitoring and health tracking assistant designed for tired parents. It
provides a soft, intuitive interface to track daily activities, growth metrics, and health records for multiple babies.

## ✨ Features

- **Soft UI Design**: A gentle, pastel-colored interface optimized for night-time use and sleep-deprived eyes.
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
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL (Custom client output)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router.
  - `components/`: Business logic components (BabySwitcher, RecordList, etc.)
  - `generated/`: Custom Prisma Client output location.
- `components/ui/`: Reusable shadcn/ui components.
- `prisma/`:
  - `schema.prisma`: Multi-model schema for baby tracking.
  - `seed.ts`: Mock data for development.
- `lib/`: Prisma client instance and utility functions.
- `public/`: Static assets.

## 📄 License

This project is private and for personal use.
