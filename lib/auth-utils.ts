import { BabyRole } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getSessionOrThrow() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

const ROLE_LEVELS = {
  [BabyRole.OWNER]: 3,
  [BabyRole.ADMIN]: 2,
  [BabyRole.VIEWER]: 1,
};

export async function checkBabyPermission(
  babyId: string,
  userId: string,
  requiredRole: BabyRole = BabyRole.VIEWER,
) {
  const userBaby = await prisma.userBaby.findUnique({
    where: {
      userId_babyId: {
        userId,
        babyId,
      },
    },
  });

  if (!userBaby) {
    throw new Error("Forbidden: You do not have access to this baby");
  }

  const userLevel = ROLE_LEVELS[userBaby.role];
  const requiredLevel = ROLE_LEVELS[requiredRole];

  if (userLevel < requiredLevel) {
    throw new Error(
      `Forbidden: Insufficient permissions. Required: ${requiredRole}`,
    );
  }

  return userBaby;
}

export async function verifyBabyAccess(
  babyId: string,
  requiredRole: BabyRole = BabyRole.VIEWER,
) {
  const session = await getSessionOrThrow();
  await checkBabyPermission(babyId, session.user.id, requiredRole);
  return session;
}

/**
 * HOF to wrap a server action with baby access verification.
 * Assumes the first argument of the action is always `babyId`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withBabyAccess<TArgs extends any[], TResult>(
  action: (babyId: string, ...args: TArgs) => Promise<TResult>,
  requiredRole: BabyRole = BabyRole.VIEWER,
) {
  return async (babyId: string, ...args: TArgs): Promise<TResult> => {
    await verifyBabyAccess(babyId, requiredRole);
    return action(babyId, ...args);
  };
}
