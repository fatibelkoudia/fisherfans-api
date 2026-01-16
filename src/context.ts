import { PrismaClient } from "@prisma/client";
import { ServiceContainer } from "./services";

export interface Context {
    prisma: PrismaClient;
    services: ServiceContainer;
}