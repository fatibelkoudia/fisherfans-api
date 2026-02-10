import { Trip } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateTripInput } from "../types/inputs";
import { businessError } from "../utils/errors";
import { UserService } from "./user.service";
import { BoatService } from "./boat.service";
import type { Context } from "../context";
import { requireAuth } from "../utils/auth";

export class TripService extends BaseService {
    private userService: UserService;
    private boatService: BoatService;

    constructor(prisma: any) {
        super(prisma);
        this.userService = new UserService(prisma);
        this.boatService = new BoatService(prisma);
    }

    /**
     * Get all non-deleted trips
     */
    async findAll(): Promise<Trip[]> {
        return this.prisma.trip.findMany({
            where: { deleted_at: null }
        });
    }

    /**
     * Find trip by ID
     */
    async findById(id: string): Promise<Trip | null> {
        return this.prisma.trip.findFirst({
            where: { id, deleted_at: null }
        });
    }

    /**
     * Create a new trip with business rule validation
     */
    async create(ctx: Context, userId: string, input: CreateTripInput): Promise<Trip> {
        requireAuth(ctx, userId);

        // BR-S1: Boat ownership required (BF26)
        await this.validateUserCanCreateTrip(userId);

        // BR-S2: Boat validity - must belong to organizer and not be deleted
        await this.validateBoatOwnership(input.boatId, userId);

        // BR-S3: Trip price validation
        this.validateTripPrice(input.prixEur);

        // BR-S4: Passenger limit validation
        await this.validatePassengerLimit(input.boatId, input.nbPassagers);

        return this.prisma.trip.create({
            data: {
                owner_id: userId,
                boat_id: input.boatId,
                titre: input.titre,
                infos_pratiques: input.infosPratiques,
                type_sortie: input.typeSortie,
                type_tarif: input.typeTarif,
                nb_passagers: input.nbPassagers,
                prix_eur: input.prixEur
            }
        });
    }

    /**
     * Soft delete a trip
     */
    async delete(ctx: Context, id: string): Promise<boolean> {
        const user = requireAuth(ctx);
        const trip = await this.findById(id);

        if (!trip) {
            businessError("Trip not found", "FF-015");
        }

        if (trip.owner_id !== user.id) {
            businessError("Trip deletion denied: unauthorized", "FF-027");
        }

        await this.prisma.trip.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: "system"
            }
        });

        return true;
    }

    /**
     * Get trip with boat details for booking validation
     */
    async getTripWithBoat(tripId: string) {
        return this.prisma.trip.findFirst({
            where: { id: tripId, deleted_at: null },
            include: { boat: true }
        });
    }

    // PRIVATE VALIDATION METHODS

    private async validateUserCanCreateTrip(userId: string): Promise<void> {
        const ownsBoats = await this.userService.ownsBoats(userId);

        if (!ownsBoats) {
            businessError("Trip creation denied: user does not own a boat", "FF-002");
        }
    }

    private async validateBoatOwnership(boatId: string, userId: string): Promise<void> {
        const boatBelongsToUser = await this.boatService.belongsToUser(boatId, userId);

        if (!boatBelongsToUser) {
            businessError("Trip creation denied: boat does not belong to user or is deleted", "FF-012");
        }
    }

    private validateTripPrice(price: number): void {
        if (price < 0) {
            businessError("Trip price cannot be negative", "FF-010");
        }
    }

    private async validatePassengerLimit(boatId: string, nbPassagers: number): Promise<void> {
        if (nbPassagers <= 0) {
            businessError("Number of passengers must be greater than 0", "FF-013");
        }

        const boat = await this.boatService.getBoatWithCapacity(boatId);

        if (!boat) {
            businessError("Boat not found", "FF-011");
        }

        if (nbPassagers > boat.capacite_max) {
            businessError(`Number of passengers cannot exceed boat capacity (${boat.capacite_max})`, "FF-014");
        }
    }
}
