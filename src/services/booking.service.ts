import { Booking } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateBookingInput } from "../types/inputs";
import { businessError } from "../utils/errors";
import { UserService } from "./user.service";
import { TripService } from "./trip.service";
import { OccurrenceService } from "./occurrence.service";
import type { Context } from "../context";
import { requireAuth } from "../utils/auth";

export class BookingService extends BaseService {
    private userService: UserService;
    private tripService: TripService;
    private occurrenceService: OccurrenceService;

    constructor(prisma: any) {
        super(prisma);
        this.userService = new UserService(prisma);
        this.tripService = new TripService(prisma);
        this.occurrenceService = new OccurrenceService(prisma);
    }

    /**
     * Find booking by ID
     */
    async findById(id: string): Promise<Booking | null> {
        return this.prisma.booking.findFirst({
            where: { id, deleted_at: null }
        });
    }

    /**
     * Create a new booking with business rule validation
     */
    async create(ctx: Context, userId: string, input: CreateBookingInput): Promise<Booking> {
        const user = requireAuth(ctx, userId);

        // Validate user exists
        await this.validateUserExists(userId);

        // Validate trip and occurrence
        const trip = await this.validateTripAndOccurrence(input);

        // BR-R1: Overbooking prevention
        await this.validateBookingCapacity(input, trip);

        // BR-R3: Booking price calculation
        const prixTotal = this.calculateBookingPrice(trip, input.nbPlaces);

        return this.prisma.booking.create({
            data: {
                trip_id: input.tripId,
                user_id: userId,
                occurrence_id: input.occurrenceId,
                date_retenue: new Date(),
                nb_places: input.nbPlaces,
                prix_total_eur: prixTotal
            }
        });
    }

    /**
     * Soft delete a booking
     */
    async delete(ctx: Context, id: string): Promise<boolean> {
        const user = requireAuth(ctx);
        const booking = await this.findById(id);

        if (!booking) {
            businessError("Booking not found", "FF-020");
        }

        if (booking.user_id !== user.id) {
            businessError("Booking deletion denied: unauthorized", "FF-028");
        }

        await this.prisma.booking.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: "system"
            }
        });

        return true;
    }

    /**
     * Get total booked places for an occurrence
     */
    async getTotalBookedPlaces(occurrenceId: string): Promise<number> {
        const bookings = await this.prisma.booking.findMany({
            where: {
                occurrence_id: occurrenceId,
                deleted_at: null
            }
        });

        return bookings.reduce((sum, booking) => sum + booking.nb_places, 0);
    }

    // PRIVATE VALIDATION METHODS

    private async validateUserExists(userId: string): Promise<void> {
        const user = await this.userService.findById(userId);

        if (!user) {
            businessError("User not found", "FF-007");
        }
    }

    private async validateTripAndOccurrence(input: CreateBookingInput) {
        // Verify trip exists
        const trip = await this.tripService.getTripWithBoat(input.tripId);

        if (!trip) {
            businessError("Trip not found", "FF-015");
        }

        // Verify occurrence belongs to trip
        await this.occurrenceService.validateOccurrenceBelongsToTrip(input.occurrenceId, input.tripId);

        return trip;
    }

    private async validateBookingCapacity(input: CreateBookingInput, trip: any): Promise<void> {
        if (input.nbPlaces <= 0) {
            businessError("Number of places must be greater than 0", "FF-019");
        }

        // Calculate total already booked places for this occurrence
        const totalBookedPlaces = await this.getTotalBookedPlaces(input.occurrenceId);
        const remainingCapacity = trip.nb_passagers - totalBookedPlaces;

        if (input.nbPlaces > remainingCapacity) {
            businessError(`Booking denied: boat capacity exceeded. Only ${remainingCapacity} places remaining`, "FF-003");
        }
    }

    private calculateBookingPrice(trip: any, nbPlaces: number): number {
        if (trip.type_tarif === 'global') {
            return Number(trip.prix_eur);
        } else {
            // par_personne
            return Number(trip.prix_eur) * nbPlaces;
        }
    }
}
