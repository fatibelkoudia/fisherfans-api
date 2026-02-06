import { businessError } from "./errors";
import type { Context } from "../context";

export function requireAuth(ctx: Context, targetUserId?: string) {
    if (!ctx.user) {
        businessError("Authentication required", "FF-401");
    }

    if (targetUserId && ctx.user.id !== targetUserId) {
        businessError("Authenticated user mismatch", "FF-401");
    }

    return ctx.user;
}
