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
        {/* StatusCard approximate height is around 90-100px */}
        <Skeleton className="h-[96px] w-full rounded-2xl" />
        <Skeleton className="h-[96px] w-full rounded-2xl" />
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

      // Fetch fast stats to power Quick Actions immediately
      stats = await getBabyStats(targetBaby.id);
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-6 md:max-w-lg">
        {/* Header (Instant Load) */}
        <Header currentBabyId={currentBabyId} />

        {/* Status Section (Instant Load) */}
        {currentBabyId ? (
          <LiveStatusSection babyId={currentBabyId} initialStats={stats} />
        ) : (
          <LiveStatusLoader />
        )}

        {/* Quick Actions (Instant Load) */}
        <section>
          <h2 className="text-text-main mb-4 px-1 text-lg font-bold">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
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
