import { PrismaClient } from "@prisma/client";
import { ServiceContainer } from "./services";
import { AuthenticatedUser } from "./types/auth";

export interface Context {
    prisma: PrismaClient;
    services: ServiceContainer;
    user?: AuthenticatedUser;
}
