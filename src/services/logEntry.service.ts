import { LogEntry } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateLogEntryInput } from "../types/inputs";
import { businessError } from "../utils/errors";
import { UserService } from "./user.service";
import type { Context } from "../context";
import { requireAuth } from "../utils/auth";

export class LogEntryService extends BaseService {
    private userService: UserService;

    constructor(prisma: any) {
        super(prisma);
        this.userService = new UserService(prisma);
    }

    /**
     * Get all non-deleted log entries
     */
    async findAll(): Promise<LogEntry[]> {
        return this.prisma.logEntry.findMany({
            where: { deleted_at: null }
        });
    }

    /**
     * Find log entry by ID
     */
    async findById(id: string): Promise<LogEntry | null> {
        return this.prisma.logEntry.findFirst({
            where: { id, deleted_at: null }
        });
    }

    /**
     * Create a new log entry with business rule validation
     */
    async create(ctx: Context, userId: string, input: CreateLogEntryInput): Promise<LogEntry> {
        const user = requireAuth(ctx, userId);

        // Verify user exists
        await this.validateUserExists(userId);

        // BR-L2: Log data validity
        this.validateLogData(input);

        return this.prisma.logEntry.create({
            data: {
                owner_id: userId,
                poisson_nom: input.poissonNom,
                photo_url: input.photoUrl,
                commentaire: input.commentaire,
                taille_cm: input.tailleCm,
                poids_kg: input.poidsKg,
                lieu: input.lieu,
                date_peche: input.datePeche,
                relache: input.relache
            }
        });
    }

    /**
     * Soft delete a log entry
     */
    async delete(ctx: Context, id: string): Promise<boolean> {
        const user = requireAuth(ctx);
        const logEntry = await this.findById(id);

        if (!logEntry) {
            businessError("Log entry not found", "FF-024");
        }

        if (logEntry.owner_id !== user.id) {
            businessError("Log entry deletion denied: unauthorized", "FF-029");
        }

        await this.prisma.logEntry.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: "system"
            }
        });

        return true;
    }

    // PRIVATE VALIDATION METHODS

    private async validateUserExists(userId: string): Promise<void> {
        const user = await this.userService.findById(userId);

        if (!user) {
            businessError("User not found", "FF-007");
        }
    }

    private validateLogData(input: CreateLogEntryInput): void {
        if (input.tailleCm <= 0) {
            businessError("Fish size must be greater than 0", "FF-021");
        }

        if (input.poidsKg <= 0) {
            businessError("Fish weight must be greater than 0", "FF-022");
        }

        if (new Date(input.datePeche) > new Date()) {
            businessError("Fishing date cannot be in the future", "FF-023");
        }
    }
}
