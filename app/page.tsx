import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { Baby, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import { getBabies, getBabyStats } from "./actions/baby";
import { getTimeline } from "./actions/timeline";
import { DiaperDialog } from "./components/actions/DiaperDialog";
import { FeedDialog } from "./components/actions/FeedDialog";
import { GrowthDialog } from "./components/actions/GrowthDialog";
import { HealthDialog } from "./components/actions/HealthDialog";
import { SleepDialog } from "./components/actions/SleepDialog";
import { Header } from "./components/Header";
import { LiveStatusSection } from "./components/LiveStatusSection";
import { QuickAction } from "./components/QuickAction";
import { RecordList, RecordListLoader } from "./components/RecordList";

// 2. LiveStatus Loader (matching LiveStatusSection size)
function LiveStatusLoader() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    </section>
  );
}

// 3. Timeline Wrapper
async function RecentActivity({ babyId }: { babyId: string }) {
  const recentRecords = await getTimeline(babyId);
  return <RecordList records={recentRecords} />;
}

import { FeedLog, SleepLog } from "./generated/prisma/client";

// 4. Main Page
export default async function Home() {
  let currentBabyId: string | undefined;
  let currentBabyName: string | undefined;
  let stats: { lastSleep: SleepLog | null; lastFeed: FeedLog | null } = {
    lastSleep: null,
    lastFeed: null,
  };

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const babies = await getBabies(session.user.id);
    if (babies.length > 0) {
      const cookieStore = await cookies();
      const selectedId = cookieStore.get("selectedBabyId")?.value;
      const targetBaby = babies.find((b) => b.id === selectedId) || babies[0];
      currentBabyId = targetBaby.id;
      currentBabyName = targetBaby.name;

      // Fetch fast stats to power Quick Actions immediately
      stats = await getBabyStats(targetBaby.id);
    }
  }

  return (
    <main className="bg-background min-h-dvh">
      <div className="mx-auto max-w-xl space-y-10 px-4 py-4 pb-12 sm:px-6">
        {/* Header (Instant Load) */}
        <Header currentBabyId={currentBabyId} />

        <section
          aria-labelledby="dashboard-heading"
          className="bg-primary text-primary-foreground relative overflow-hidden rounded-[2rem] px-6 py-7 shadow-[0_18px_40px_rgba(21,128,61,0.2)]"
        >
          <div className="bg-primary-foreground/10 absolute -top-16 -right-12 h-40 w-40 rounded-full" />
          <div className="bg-primary-foreground/10 absolute right-12 -bottom-20 h-32 w-32 rounded-full" />
          <div className="relative max-w-sm">
            <p className="text-primary-foreground/75 text-sm font-semibold">
              {currentBabyName
                ? `Today with ${currentBabyName}`
                : "Your care journal"}
            </p>
            <h1
              id="dashboard-heading"
              className="mt-2 text-3xl font-bold tracking-tight"
            >
              {currentBabyName
                ? "A calmer day of care."
                : "Start tracking the little moments."}
            </h1>
            <p className="text-primary-foreground/80 mt-3 text-sm leading-6">
              {currentBabyName
                ? "See what matters now, then log the next moment in seconds."
                : "Add a baby from the menu above to begin your care timeline."}
            </p>
          </div>
        </section>

        <section aria-labelledby="status-heading" className="space-y-4">
          <div className="px-1">
            <p className="text-primary text-xs font-bold tracking-[0.1em] uppercase">
              Live overview
            </p>
            <h2
              id="status-heading"
              className="text-foreground mt-1 text-xl font-bold"
            >
              Right now
            </h2>
          </div>
          {currentBabyId ? (
            <LiveStatusSection babyId={currentBabyId} initialStats={stats} />
          ) : (
            <LiveStatusLoader />
          )}
        </section>

        {/* Quick Actions (Instant Load) */}
        <section aria-labelledby="quick-actions-heading">
          <div className="mb-4 px-1">
            <p className="text-primary text-xs font-bold tracking-[0.1em] uppercase">
              Quick log
            </p>
            <h2
              id="quick-actions-heading"
              className="text-foreground mt-1 text-xl font-bold"
            >
              Capture a moment
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentBabyId ? (
              <SleepDialog babyId={currentBabyId} lastSleep={stats.lastSleep} />
            ) : (
              <QuickAction label="Sleep" icon={Moon} />
            )}
            {currentBabyId ? (
              <FeedDialog babyId={currentBabyId} />
            ) : (
              <QuickAction label="Feed" icon={Milk} />
            )}
            {currentBabyId ? (
              <DiaperDialog babyId={currentBabyId} />
            ) : (
              <QuickAction label="Diaper" icon={Baby} />
            )}
            {currentBabyId ? (
              <HealthDialog babyId={currentBabyId} />
            ) : (
              <QuickAction label="Health" icon={Thermometer} />
            )}
            {currentBabyId ? (
              <GrowthDialog babyId={currentBabyId} />
            ) : (
              <QuickAction label="Growth" icon={Ruler} />
            )}
          </div>
        </section>

        {/* Recent History (Streamed) */}
        <section>
          {currentBabyId ? (
            <Suspense fallback={<RecordListLoader />}>
              <RecentActivity babyId={currentBabyId} />
            </Suspense>
          ) : (
            <RecordList records={[]} />
          )}
        </section>
      </div>
    </main>
  );
}
