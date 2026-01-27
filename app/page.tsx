import { Baby, FileText, Milk, Moon, Ruler, Thermometer } from "lucide-react";
import { Header } from "./components/Header";
import { QuickAction } from "./components/QuickAction";
import { RecordList } from "./components/RecordList";
import { StatusCard } from "./components/StatusCard";

export default function Home() {
  // Mock Data
  const recentRecords = [
    {
      id: "1",
      type: "Temperature" as const,
      value: "36.6°C - Normal",
      recordedAt: new Date(Date.now() - 1000 * 60 * 30),
    }, // 30 mins ago
    {
      id: "2",
      type: "Growth" as const,
      value: "Height: 65cm",
      recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    }, // 1 day ago
  ];

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 space-y-8">
        <Header />

        {/* Status Section */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatusCard
              title="Last Sleep"
              value="2h 15m"
              subValue="Woke up 10m ago"
              icon={Moon}
              colorClass="bg-indigo-50/50 border-indigo-100 text-indigo-900"
            />
            <StatusCard
              title="Last Feed"
              value="120ml"
              subValue="2h ago"
              icon={Milk}
              colorClass="bg-orange-50/50 border-orange-100 text-orange-900"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-text-main mb-4 px-1">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction label="Sleep" icon={Moon} />
            <QuickAction label="Feed" icon={Milk} />
            <QuickAction label="Diaper" icon={Baby} />
            <QuickAction label="Temp" icon={Thermometer} />
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
