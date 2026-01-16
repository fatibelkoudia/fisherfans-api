import { Occurrence } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateOccurrenceInput } from "../types/inputs";
import { businessError } from "../utils/errors";
import { TripService } from "./trip.service";

export class OccurrenceService extends BaseService {
    private tripService: TripService;

    constructor(prisma: any) {
        super(prisma);
        this.tripService = new TripService(prisma);
    }

    /**
     * Find occurrence by ID
     */
    async findById(id: string): Promise<Occurrence | null> {
        return this.prisma.occurrence.findUnique({
            where: { id }
        });
    }

    /**
     * Create a new occurrence with business rule validation
     */
    async create(input: CreateOccurrenceInput): Promise<Occurrence> {
        // Verify trip exists
        await this.validateTripExists(input.tripId);

        // BR-O1: Date and time consistency
        this.validateDateTimeConsistency(input);

        return this.prisma.occurrence.create({
            data: {
                trip_id: input.tripId,
                date_debut: input.dateDebut,
                date_fin: input.dateFin,
                heure_depart: input.heureDepart,
                heure_fin: input.heureFin
            }
        });
    }

    /**
     * Validate that occurrence belongs to the specified trip
     */
    async validateOccurrenceBelongsToTrip(occurrenceId: string, tripId: string): Promise<void> {
        const occurrence = await this.findById(occurrenceId);

        if (!occurrence || occurrence.trip_id !== tripId) {
            businessError("Occurrence not found for this trip", "FF-018");
        }
    }

    // PRIVATE VALIDATION METHODS

    private async validateTripExists(tripId: string): Promise<void> {
        const trip = await this.tripService.findById(tripId);

        if (!trip) {
            businessError("Trip not found", "FF-015");
        }
    }

    private validateDateTimeConsistency(input: CreateOccurrenceInput): void {
        if (input.dateDebut >= input.dateFin) {
            businessError("Start date must be before end date", "FF-016");
        }

        if (input.heureDepart >= input.heureFin) {
            businessError("Departure time must be before end time", "FF-017");
        }
    }
}