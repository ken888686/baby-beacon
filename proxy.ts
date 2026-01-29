import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getBabies, switchBaby } from "./app/actions/baby";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const selectedBabyId = cookieStore.get("selectedBabyId")?.value;

  if (!selectedBabyId) {
    const babies = await getBabies();
    if (babies.length > 0) {
      await switchBaby(babies[0].id);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};
