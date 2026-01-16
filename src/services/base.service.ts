import { PrismaClient } from "@prisma/client";

export abstract class BaseService {
    protected readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
}