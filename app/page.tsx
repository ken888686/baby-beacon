import { Baby, FileText, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { Header } from "./components/Header";
import { QuickAction } from "./components/QuickAction";
import { RecordList, TimelineRecord } from "./components/RecordList";
import { StatusCard } from "./components/StatusCard";

export default function Home() {
  // Mock Data - 模擬從後端 API 取得並轉換後的資料
  const recentRecords: TimelineRecord[] = [
    {
      id: "1",
      category: "FEED",
      title: "Bottle Feed (Formula)",
      details: "140ml",
      recordedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    },
    {
      id: "2",
      category: "SLEEP",
      title: "Nap",
      details: "1h 30m duration",
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
    },
    {
      id: "3",
      category: "DIAPER",
      title: "Diaper Change",
      details: "Wet & Dirty (Soft)",
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
    {
      id: "4",
      category: "HEALTH",
      title: "Temperature",
      details: "36.8°C - Normal",
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: "5",
      category: "GROWTH",
      title: "Growth Check",
      details: "Height: 62cm, Weight: 6.5kg",
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  ];

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-2">
        <Header />

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
