import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Baby, FileText, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { cookies, headers } from "next/headers";
import { getBabies, getBabyStats } from "./actions/baby";
import { getTimeline, TimelineItem } from "./actions/timeline";
import { Header } from "./components/Header";
import { QuickAction } from "./components/QuickAction";
import { RecordList } from "./components/RecordList";
import { StatusCard } from "./components/StatusCard";
import { FeedLog, FeedType, SleepLog } from "./generated/prisma/client";

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

      // Use selected ID if it exists and belongs to the user, otherwise default to first baby
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

  // Format Sleep Status
  let sleepValue = "--";
  let sleepSubValue = "No records";

  if (stats.lastSleep) {
    if (!stats.lastSleep.endTime) {
      sleepValue = "Sleeping...";
      sleepSubValue = `Started ${formatDistanceToNow(stats.lastSleep.startTime, { addSuffix: true })}`;
    } else {
      const durationMs =
        stats.lastSleep.endTime.getTime() - stats.lastSleep.startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      sleepValue = `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
      sleepSubValue = `Woke up ${formatDistanceToNow(stats.lastSleep.endTime, { addSuffix: true })}`;
    }
  }

  // Format Feed Status
  let feedValue = "--";
  let feedSubValue = "No records";

  if (stats.lastFeed) {
    if (stats.lastFeed.type === FeedType.BREAST) {
      feedValue = `${Math.round((stats.lastFeed.duration || 0) / 60)}m`;
    } else if (stats.lastFeed.type === FeedType.SOLID) {
      feedValue = "Solid";
    } else {
      feedValue = `${stats.lastFeed.amount || 0}ml`;
    }
    feedSubValue = `${formatDistanceToNow(stats.lastFeed.recordedAt, { addSuffix: true })}`;
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-2">
        <Header currentBabyId={currentBabyId} />

        {/* Status Section */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatusCard
              title="Last Sleep"
              value={sleepValue}
              subValue={sleepSubValue}
              icon={Moon}
              className="border-slate-200 bg-slate-50/50 text-slate-700"
            />
            <StatusCard
              title="Last Feed"
              value={feedValue}
              subValue={feedSubValue}
              icon={Milk}
              className="border-amber-200 bg-amber-50/50 text-amber-800"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-text-main mb-4 px-1 text-lg font-bold">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction label="Sleep" icon={Moon} />
            <QuickAction label="Feed" icon={Milk} />
            <QuickAction label="Diaper" icon={Baby} />
            <QuickAction label="Health" icon={Thermometer} />
            <QuickAction label="Growth" icon={Ruler} />
            <QuickAction label="Note" icon={FileText} />
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
