import { Skeleton } from "@/components/ui/skeleton";
import { BabySwitcherLoader } from "./components/BabySwitcher";
import { UserMenuLoader } from "./components/UserMenu";

export default function Loading() {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-md space-y-8 px-4 py-2">
        {/* Header Loading */}
        <header className="flex items-center justify-between py-6">
          <BabySwitcherLoader />
          <UserMenuLoader />
        </header>

        {/* Status Section Loading */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[200px] rounded-2xl" />
          </div>
        </section>

        {/* Quick Actions Loading */}
        <section>
          <Skeleton className="mb-4 h-6 w-full" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </section>

        {/* Recent History Loading */}
        <section>
          <div className="space-y-4">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
