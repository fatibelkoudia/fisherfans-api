import { Boat } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateBoatInput, BBox } from "../types/inputs";
import { businessError } from "../utils/errors";
import { UserService } from "./user.service";
import type { Context } from "../context";
import { requireAuth } from "../utils/auth";

export class BoatService extends BaseService {
    private userService: UserService;

    constructor(prisma: any) {
        super(prisma);
        this.userService = new UserService(prisma);
    }

    /**
     * Get all non-deleted boats
     */
    async findAll(): Promise<Boat[]> {
        return this.prisma.boat.findMany({
            where: { deleted_at: null }
        });
    }

    /**
     * Find boat by ID
     */
    async findById(id: string): Promise<Boat | null> {
        return this.prisma.boat.findFirst({
            where: { id, deleted_at: null }
        });
    }

    /**
     * BR-G1: Bounding box search for boats (BF24)
     */
    async findByLocation(bbox: BBox): Promise<Boat[]> {
        this.validateBoundingBox(bbox);

        return this.prisma.boat.findMany({
            where: {
                deleted_at: null,
                lat: { gte: bbox.minLat, lte: bbox.maxLat },
                lon: { gte: bbox.minLon, lte: bbox.maxLon }
            }
        });
    }

    /**
     * Create a new boat with business rule validation
     */
    async create(ctx: Context, userId: string, input: CreateBoatInput): Promise<Boat> {
        requireAuth(ctx, userId);

        // BR-B1: Boat license required (BF27)
        await this.validateUserCanCreateBoat(userId);

        // BR-B3: Capacity consistency
        this.validateCapacityConsistency(input);

        return this.prisma.boat.create({
            data: {
                user_id: userId,
                nom: input.nom,
                description: input.description,
                marque: input.marque,
                annee: input.annee,
                photo_url: input.photoUrl,
                permis_requis: input.permisRequis,
                type: input.type,
                equipements: input.equipements,
                caution_eur: input.cautionEur,
                capacite_max: input.capaciteMax,
                couchages: input.couchages,
                port_attache_ville: input.portAttacheVille,
                lat: input.lat,
                lon: input.lon,
                motorisation: input.motorisation,
                puissance_cv: input.puissanceCv
            }
        });
    }

    /**
     * Soft delete a boat
     */
    async delete(ctx: Context, id: string): Promise<boolean> {
        const user = requireAuth(ctx);
        const boat = await this.findById(id);

        if (!boat) {
            businessError("Boat not found", "FF-011");
        }

        if (boat.user_id !== user.id) {
            businessError("Boat deletion denied: unauthorized", "FF-026");
        }

        await this.prisma.boat.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: "system"
            }
        });

        return true;
    }

    /**
     * Check if boat belongs to user and is not deleted
     */
    async belongsToUser(boatId: string, userId: string): Promise<boolean> {
        const boat = await this.prisma.boat.findFirst({
            where: {
                id: boatId,
                user_id: userId,
                deleted_at: null
            }
        });

        return !!boat;
    }

    /**
     * Get boat with capacity information
     */
    async getBoatWithCapacity(boatId: string): Promise<Boat | null> {
        return this.findById(boatId);
    }

    // PRIVATE VALIDATION METHODS
    private validateBoundingBox(bbox: BBox): void {
        if (bbox.minLat >= bbox.maxLat || bbox.minLon >= bbox.maxLon) {
            businessError("Invalid bounding box coordinates", "FF-004");
        }
    }

    private async validateUserCanCreateBoat(userId: string): Promise<void> {
        const hasValidLicense = await this.userService.hasValidBoatLicense(userId);

        if (!hasValidLicense) {
            businessError("Boat creation denied: missing boat license", "FF-001");
        }
    }

    private validateCapacityConsistency(input: CreateBoatInput): void {
        if (input.capaciteMax <= 0) {
            businessError("Boat capacity must be greater than 0", "FF-008");
        }

        if (input.couchages > input.capaciteMax) {
            businessError("Number of berths cannot exceed maximum capacity", "FF-009");
        }
    }
}
