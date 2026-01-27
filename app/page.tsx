import { auth } from "@/lib/auth";
import { Baby, FileText, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { cookies, headers } from "next/headers";
import { getBabies } from "./actions/baby";
import { getTimeline, TimelineItem } from "./actions/timeline";
import { Header } from "./components/Header";
import { QuickAction } from "./components/QuickAction";
import { RecordList } from "./components/RecordList";
import { StatusCard } from "./components/StatusCard";

export default async function Home() {
  let recentRecords: TimelineItem[] = [];
  let currentBabyId: string | undefined;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    recentRecords = [
      {
        id: "",
        category: "SLEEP",
        title: "Last Sleep",
        details: "1h 30m",
        recordedAt: new Date(),
      },
    ];
  } else {
    const babies = await getBabies(session.user.id);
    if (babies.length > 0) {
      const cookieStore = await cookies();
      const selectedId = cookieStore.get("selectedBabyId")?.value;
      
      // Use selected ID if it exists and belongs to the user, otherwise default to first baby
      const targetBaby = babies.find(b => b.id === selectedId) || babies[0];
      currentBabyId = targetBaby.id;
      recentRecords = await getTimeline(targetBaby.id);
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-2">
        <Header userId={session?.user.id ?? ""} currentBabyId={currentBabyId} />

        {/* Status Section */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatusCard
              title="Last Sleep"
              value="1h 30m"
              subValue="Woke up 2h ago"
              icon={Moon}
              className="border-slate-200 bg-slate-50/50 text-slate-700"
            />
            <StatusCard
              title="Last Feed"
              value="140ml"
              subValue="45m ago"
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
