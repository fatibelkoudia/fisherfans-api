import { PrismaClient } from "@prisma/client";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";
import { BoatService } from "./boat.service";
import { TripService } from "./trip.service";
import { OccurrenceService } from "./occurrence.service";
import { BookingService } from "./booking.service";
import { LogEntryService } from "./logEntry.service";

export class ServiceContainer {
    public readonly user: UserService;
    public readonly auth: AuthService;
    public readonly boat: BoatService;
    public readonly trip: TripService;
    public readonly occurrence: OccurrenceService;
    public readonly booking: BookingService;
    public readonly logEntry: LogEntryService;

    constructor(prisma: PrismaClient) {
        this.user = new UserService(prisma);
        this.auth = new AuthService(prisma, this.user);
        this.boat = new BoatService(prisma);
        this.trip = new TripService(prisma);
        this.occurrence = new OccurrenceService(prisma);
        this.booking = new BookingService(prisma);
        this.logEntry = new LogEntryService(prisma);
    }
}

export * from "./user.service";
export * from "./auth.service";
export * from "./boat.service";
export * from "./trip.service";
export * from "./occurrence.service";
export * from "./booking.service";
export * from "./logEntry.service";
export * from "./base.service";
