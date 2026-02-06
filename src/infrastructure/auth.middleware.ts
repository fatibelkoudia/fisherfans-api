import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import { AuthenticatedUser } from "../types/auth";

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

export function jwtAuthMiddleware(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
        const payload = verifyJwt(token);
        const userId = typeof payload.sub === "string" ? payload.sub : undefined;
        const email = typeof payload.email === "string" ? payload.email : undefined;

        if (userId && email) {
            req.user = { id: userId, email };
        }
    } catch {
        // Keep request unauthenticated on invalid tokens.
    }

    next();
}
