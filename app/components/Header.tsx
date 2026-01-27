import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { BabySwitcher, BabySwitcherLoader } from "./BabySwitcher";
import { UserMenu } from "./UserMenu";

export function Header() {
  const allBabies = prisma.baby.findMany({
    where: {
      userId: "788751e2-2e3c-459d-9597-dde6210ddabe",
    },
  });

  return (
    <header className="flex items-center justify-between py-6">
      <Suspense fallback={<BabySwitcherLoader />}>
        <BabySwitcher babies={allBabies} />
      </Suspense>
      <UserMenu />
    </header>
  );
}
