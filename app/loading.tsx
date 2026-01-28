import { HeaderLoader } from "./components/Header";
import { QuickActionLoader } from "./components/QuickAction";
import { RecordListLoader } from "./components/RecordList";
import { StatusCardLoader } from "./components/StatusCard";

export default function Loading() {
  return (
    <main className="bg-background animate-fade-in min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-2">
        {/* Header Loading */}
        <HeaderLoader />

        {/* Status Section Loading */}
        <StatusCardLoader />

        {/* Quick Actions Loading */}
        <section>
          <h2 className="text-text-main mb-4 px-1 text-lg font-bold">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <QuickActionLoader key={i} />
            ))}
          </div>
        </section>

        {/* Recent History Loading */}
        <section>
          <RecordListLoader />
        </section>
      </div>
    </main>
  );
}
