import { Suspense } from "react";
import type { Baby } from "../generated/prisma/client";
import { BabySwitcher, BabySwitcherLoader } from "./BabySwitcher";
import { UserMenu, UserMenuLoader } from "./UserMenu";

export function Header({
  babies,
  currentBabyId,
}: {
  babies: Baby[];
  currentBabyId?: string;
}) {
  return (
    <header className="flex items-center justify-between py-6">
      <BabySwitcher babies={babies} currentBabyId={currentBabyId} />
      <Suspense fallback={<UserMenuLoader />}>
        <UserMenu />
      </Suspense>
    </header>
  );
}

export function HeaderLoader() {
  return (
    <header className="flex items-center justify-between py-6">
      <BabySwitcherLoader />
      <UserMenuLoader />
    </header>
  );
}
