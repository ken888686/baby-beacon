import { auth } from "@/lib/auth";
import { Baby, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { cookies, headers } from "next/headers";
import { getBabies, getBabyStats } from "./actions/baby";
import { getTimeline, TimelineItem } from "./actions/timeline";
import { DiaperDialog } from "./components/actions/DiaperDialog";
import { FeedDialog } from "./components/actions/FeedDialog";
import { SleepDialog } from "./components/actions/SleepDialog";
import { Header } from "./components/Header";
import { LiveStatusSection } from "./components/LiveStatusSection";
import { QuickAction } from "./components/QuickAction";
import { RecordList } from "./components/RecordList";
import { FeedLog, SleepLog } from "./generated/prisma/client";

export default async function Home() {
  let recentRecords: TimelineItem[] = [];
  let currentBabyId: string | undefined;
  let stats = {
    lastSleep: null as SleepLog | null,
    lastFeed: null as FeedLog | null,
  };

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const babies = await getBabies();
    if (babies.length > 0) {
      const cookieStore = await cookies();
      const selectedId = cookieStore.get("selectedBabyId")?.value;

      const targetBaby = babies.find((b) => b.id === selectedId) || babies[0];
      currentBabyId = targetBaby.id;

      const [timelineData, statsData] = await Promise.all([
        getTimeline(targetBaby.id),
        getBabyStats(targetBaby.id),
      ]);

      recentRecords = timelineData;
      stats = statsData;
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-2">
        {/* Header */}
        <Header currentBabyId={currentBabyId} />

        {/* Status Section */}
        <LiveStatusSection babyId={currentBabyId} initialStats={stats} />

        {/* Quick Actions */}
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
            <QuickAction label="Health" icon={Thermometer} />
            <QuickAction label="Growth" icon={Ruler} />
          </div>
        </section>

        {/* Recent History */}
        <section>
          <RecordList records={recentRecords} />
        </section>
      </div>
    </main>
  );
}
