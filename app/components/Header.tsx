import { Suspense } from "react";
import { getBabies } from "../actions/baby";
import { BabySwitcher, BabySwitcherLoader } from "./BabySwitcher";
import { UserMenu, UserMenuLoader } from "./UserMenu";

export function Header({ currentBabyId }: { currentBabyId?: string }) {
  const allBabies = getBabies();

  return (
    <header className="flex items-center justify-between py-6">
      <Suspense fallback={<BabySwitcherLoader />}>
        <BabySwitcher babies={allBabies} currentBabyId={currentBabyId} />
      </Suspense>
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
