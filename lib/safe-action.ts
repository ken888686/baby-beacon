import { BabyRole } from "@/app/generated/prisma/client";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { checkBabyPermission, getSessionOrThrow } from "./auth-utils";

export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    console.error("Action error:", e);

    if (e.message) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSessionOrThrow();
  return next({ ctx: { session } });
});

export const getBabyActionClient = (requiredRole: BabyRole = BabyRole.VIEWER) =>
  authActionClient.use(async ({ ctx, clientInput, next }) => {
    // We assume the schema parses a babyId string
    const input = clientInput as { babyId?: string };

    if (input.babyId) {
      await checkBabyPermission(
        input.babyId,
        ctx.session.user.id,
        requiredRole,
      );
    } else {
      throw new Error("babyId is required for this action");
    }

    return next();
  });
