import { Suspense } from "react";
import { getBabies } from "../actions/baby";
import { BabySwitcher, BabySwitcherLoader } from "./BabySwitcher";
import { UserMenu, UserMenuLoader } from "./UserMenu";

export function Header({ userId }: { userId: string }) {
  const allBabies = getBabies(userId);

  return (
    <header className="flex items-center justify-between py-6">
      <Suspense fallback={<BabySwitcherLoader />}>
        <BabySwitcher babies={allBabies} userId={userId} />
      </Suspense>
      <Suspense fallback={<UserMenuLoader />}>
        <UserMenu />
      </Suspense>
    </header>
  );
}
