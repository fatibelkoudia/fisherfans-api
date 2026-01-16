import { Context } from "../context";
import {
    Boat,
    BoatType,
    Booking,
    LogEntry,
    Occurrence,
    PermitType,
    Trip,
    TripPricingType,
    TripType,
    User,
    UserActivityType,
    UserStatus
} from "@prisma/client";
import { GraphQLScalarType, Kind, GraphQLError, ValueNode } from "graphql";

type EmptyArgs = Record<string, never>;
type IdArgs = { id: string };
type BBox = { minLat: number; maxLat: number; minLon: number; maxLon: number };
type BBoxArgs = { bbox: BBox };

type CreateUserInput = {
    nom: string;
    prenom: string;
    dateNaissance: Date;
    email: string;
    telephone: string;
    adresse: string;
    codePostal: string;
    ville: string;
    langues: string[];
    photoUrl?: string | null;
    statut: UserStatus;
    societe?: string | null;
    typeActivite?: UserActivityType | null;
    siret?: string | null;
    rc?: string | null;
    permisBateau?: string | null;
    assurance?: string | null;
};

type CreateBoatInput = {
    nom: string;
    description?: string | null;
    marque: string;
    annee: number;
    photoUrl?: string | null;
    permisRequis: PermitType;
    type: BoatType;
    equipements: string[];
    cautionEur: number;
    capaciteMax: number;
    couchages: number;
    portAttacheVille: string;
    lat: number;
    lon: number;
    motorisation: string;
    puissanceCv: number;
};

type CreateTripInput = {
    boatId: string;
    titre: string;
    infosPratiques?: string | null;
    typeSortie: TripType;
    typeTarif: TripPricingType;
    nbPassagers: number;
    prixEur: number;
};

type CreateOccurrenceInput = {
    tripId: string;
    dateDebut: Date;
    dateFin: Date;
    heureDepart: Date;
    heureFin: Date;
};

type CreateBookingInput = {
    tripId: string;
    occurrenceId: string;
    nbPlaces: number;
};

type CreateLogEntryInput = {
    poissonNom: string;
    photoUrl?: string | null;
    commentaire?: string | null;
    tailleCm: number;
    poidsKg: number;
    lieu: string;
    datePeche: Date;
    relache: boolean;
};


// BUSINESS ERROR HELPER
function businessError(message: string, code: string): never {
    throw new GraphQLError(message, {
        extensions: { code }
    });
}

// RESOLVERS

export const resolvers = {
    // DateTime Scalar
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'Date custom scalar type',
        serialize(value: unknown) {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        },
        parseValue(value: unknown) {
            if (value instanceof Date) {
                return value;
            }
            return new Date(String(value));
        },
        parseLiteral(ast: ValueNode) {
            if (ast.kind === Kind.STRING) {
                return new Date(ast.value);
            }
            return null;
        },
    }),

    // QUERIES

    Query: {
        // Users
        users: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.prisma.user.findMany({
                where: { deleted_at: null }
            });
        },
        user: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.prisma.user.findFirst({
                where: { id, deleted_at: null }
            });
        },

        // Boats
        boats: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.prisma.boat.findMany({
                where: { deleted_at: null }
            });
        },
        boat: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.prisma.boat.findFirst({
                where: { id, deleted_at: null }
            });
        },

        // BR-G1: Bounding box search for boats (BF24)
        boatsByLocation: async (_parent: unknown, { bbox }: BBoxArgs, context: Context) => {
            // Validate bounding box
            if (bbox.minLat >= bbox.maxLat || bbox.minLon >= bbox.maxLon) {
                businessError("Invalid bounding box coordinates", "FF-004");
            }

            return context.prisma.boat.findMany({
                where: {
                    deleted_at: null,
                    lat: { gte: bbox.minLat, lte: bbox.maxLat },
                    lon: { gte: bbox.minLon, lte: bbox.maxLon }
                }
            });
        },

        // Trips
        trips: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.prisma.trip.findMany({
                where: { deleted_at: null }
            });
        },
        trip: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.prisma.trip.findFirst({
                where: { id, deleted_at: null }
            });
        },

        // Log Entries
        logEntries: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.prisma.logEntry.findMany({
                where: { deleted_at: null }
            });
        },
        logEntry: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.prisma.logEntry.findFirst({
                where: { id, deleted_at: null }
            });
        }
    },

    // ========================================================================
    // MUTATIONS
    // ========================================================================

    Mutation: {
        // -------------------------------------------------------------------
        // USER MUTATIONS
        // -------------------------------------------------------------------

        createUser: async (_parent: unknown, { input }: { input: CreateUserInput }, context: Context) => {
            // BR-U2: Professional user constraints
            if (input.statut === 'professionnel') {
                if (!input.societe || !input.typeActivite || !input.siret || !input.rc) {
                    businessError(
                        "Professional users must provide: societe, typeActivite, siret, rc",
                        "FF-005"
                    );
                }
            }

            // BR-U3: Unique email (enforced at DB level, but we give better error)
            const existingUser = await context.prisma.user.findUnique({
                where: { email: input.email }
            });
            if (existingUser) {
                businessError("A user with this email already exists", "FF-006");
            }

            return context.prisma.user.create({
                data: {
                    nom: input.nom,
                    prenom: input.prenom,
                    date_naissance: input.dateNaissance,
                    email: input.email,
                    telephone: input.telephone,
                    adresse: input.adresse,
                    code_postal: input.codePostal,
                    ville: input.ville,
                    langues: input.langues,
                    photo_url: input.photoUrl,
                    statut: input.statut,
                    societe: input.societe,
                    type_activite: input.typeActivite,
                    siret: input.siret,
                    rc: input.rc,
                    permis_bateau: input.permisBateau,
                    assurance: input.assurance
                }
            });
        },

        // BR-U4: GDPR soft delete with anonymization
        deleteUser: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            const user = await context.prisma.user.findFirst({
                where: { id, deleted_at: null }
            });

            if (!user) {
                businessError("User not found", "FF-007");
            }

            await context.prisma.user.update({
                where: { id },
                data: {
                    deleted_at: new Date(),
                    deleted_by: "system", // In real app, this would be the admin/user ID
                    // Anonymize personal data
                    nom: "DELETED",
                    prenom: "USER",
                    email: `deleted_${id}@anonymized.local`,
                    telephone: "0000000000",
                    adresse: "ANONYMIZED",
                }
            });

            return true;
        },

        // -------------------------------------------------------------------
        // BOAT MUTATIONS
        // -------------------------------------------------------------------

        createBoat: async (_parent: unknown, { userId, input }: { userId: string; input: CreateBoatInput }, context: Context) => {
            // Get the user
            const user = await context.prisma.user.findFirst({
                where: { id: userId, deleted_at: null }
            });

            if (!user) {
                businessError("User not found", "FF-007");
            }

            // BR-B1: Boat license required (BF27)
            if (!user.permis_bateau || user.permis_bateau.length !== 8) {
                businessError("Boat creation denied: missing boat license", "FF-001");
            }

            // BR-B3: Capacity consistency
            if (input.capaciteMax <= 0) {
                businessError("Boat capacity must be greater than 0", "FF-008");
            }
            if (input.couchages > input.capaciteMax) {
                businessError("Number of berths cannot exceed maximum capacity", "FF-009");
            }

            return context.prisma.boat.create({
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
        },

        deleteBoat: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            const boat = await context.prisma.boat.findFirst({
                where: { id, deleted_at: null }
            });

            if (!boat) {
                businessError("Boat not found", "FF-011");
            }

            await context.prisma.boat.update({
                where: { id },
                data: {
                    deleted_at: new Date(),
                    deleted_by: "system"
                }
            });

            return true;
        },

        // -------------------------------------------------------------------
        // TRIP MUTATIONS
        // -------------------------------------------------------------------

        createTrip: async (_parent: unknown, { userId, input }: { userId: string; input: CreateTripInput }, context: Context) => {
            // BR-S1: Boat ownership required (BF26)
            const userBoats = await context.prisma.boat.findMany({
                where: { user_id: userId, deleted_at: null }
            });

            if (userBoats.length === 0) {
                businessError("Trip creation denied: user does not own a boat", "FF-002");
            }

            // BR-S2: Boat validity - must belong to organizer and not be deleted
            const boat = await context.prisma.boat.findFirst({
                where: { id: input.boatId, user_id: userId, deleted_at: null }
            });

            if (!boat) {
                businessError("Trip creation denied: boat does not belong to user or is deleted", "FF-012");
            }

            // BR-S3: Trip price validation
            if (input.prixEur < 0) {
                businessError("Trip price cannot be negative", "FF-010");
            }

            // BR-S4: Passenger limit
            if (input.nbPassagers <= 0) {
                businessError("Number of passengers must be greater than 0", "FF-013");
            }
            if (input.nbPassagers > boat.capacite_max) {
                businessError(`Number of passengers cannot exceed boat capacity (${boat.capacite_max})`, "FF-014");
            }

            return context.prisma.trip.create({
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
        },

        deleteTrip: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            const trip = await context.prisma.trip.findFirst({
                where: { id, deleted_at: null }
            });

            if (!trip) {
                businessError("Trip not found", "FF-015");
            }

            await context.prisma.trip.update({
                where: { id },
                data: {
                    deleted_at: new Date(),
                    deleted_by: "system"
                }
            });

            return true;
        },

        // -------------------------------------------------------------------
        // OCCURRENCE MUTATIONS
        // -------------------------------------------------------------------

        createOccurrence: async (_parent: unknown, { input }: { input: CreateOccurrenceInput }, context: Context) => {
            // Verify trip exists
            const trip = await context.prisma.trip.findFirst({
                where: { id: input.tripId, deleted_at: null }
            });

            if (!trip) {
                businessError("Trip not found", "FF-015");
            }

            // BR-O1: Date and time consistency
            if (input.dateDebut >= input.dateFin) {
                businessError("Start date must be before end date", "FF-016");
            }
            if (input.heureDepart >= input.heureFin) {
                businessError("Departure time must be before end time", "FF-017");
            }

            return context.prisma.occurrence.create({
                data: {
                    trip_id: input.tripId,
                    date_debut: input.dateDebut,
                    date_fin: input.dateFin,
                    heure_depart: input.heureDepart,
                    heure_fin: input.heureFin
                }
            });
        },

        // -------------------------------------------------------------------
        // BOOKING MUTATIONS
        // -------------------------------------------------------------------

        createBooking: async (_parent: unknown, { userId, input }: { userId: string; input: CreateBookingInput }, context: Context) => {
            // Verify user exists
            const user = await context.prisma.user.findFirst({
                where: { id: userId, deleted_at: null }
            });

            if (!user) {
                businessError("User not found", "FF-007");
            }

            // Verify trip exists
            const trip = await context.prisma.trip.findFirst({
                where: { id: input.tripId, deleted_at: null },
                include: { boat: true }
            });

            if (!trip) {
                businessError("Trip not found", "FF-015");
            }

            // Verify occurrence exists
            const occurrence = await context.prisma.occurrence.findUnique({
                where: { id: input.occurrenceId }
            });

            if (!occurrence || occurrence.trip_id !== input.tripId) {
                businessError("Occurrence not found for this trip", "FF-018");
            }

            // BR-R1: Overbooking prevention
            if (input.nbPlaces <= 0) {
                businessError("Number of places must be greater than 0", "FF-019");
            }

            // Calculate total already booked places for this occurrence
            const existingBookings = await context.prisma.booking.findMany({
                where: {
                    occurrence_id: input.occurrenceId,
                    deleted_at: null
                }
            });

            const totalBookedPlaces = existingBookings.reduce((sum, b) => sum + b.nb_places, 0);
            const remainingCapacity = trip.nb_passagers - totalBookedPlaces;

            if (input.nbPlaces > remainingCapacity) {
                businessError(`Booking denied: boat capacity exceeded. Only ${remainingCapacity} places remaining`, "FF-003");
            }

            // BR-R3: Booking price calculation
            let prixTotal: number;
            if (trip.type_tarif === 'global') {
                prixTotal = Number(trip.prix_eur);
            } else {
                // par_personne
                prixTotal = Number(trip.prix_eur) * input.nbPlaces;
            }

            return context.prisma.booking.create({
                data: {
                    trip_id: input.tripId,
                    user_id: userId,
                    occurrence_id: input.occurrenceId,
                    date_retenue: new Date(),
                    nb_places: input.nbPlaces,
                    prix_total_eur: prixTotal
                }
            });
        },

        deleteBooking: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            const booking = await context.prisma.booking.findFirst({
                where: { id, deleted_at: null }
            });

            if (!booking) {
                businessError("Booking not found", "FF-020");
            }

            await context.prisma.booking.update({
                where: { id },
                data: {
                    deleted_at: new Date(),
                    deleted_by: "system"
                }
            });

            return true;
        },

        // -------------------------------------------------------------------
        // LOG ENTRY MUTATIONS
        // -------------------------------------------------------------------

        createLogEntry: async (_parent: unknown, { userId, input }: { userId: string; input: CreateLogEntryInput }, context: Context) => {
            // Verify user exists
            const user = await context.prisma.user.findFirst({
                where: { id: userId, deleted_at: null }
            });

            if (!user) {
                businessError("User not found", "FF-007");
            }

            // BR-L2: Log data validity
            if (input.tailleCm <= 0) {
                businessError("Fish size must be greater than 0", "FF-021");
            }
            if (input.poidsKg <= 0) {
                businessError("Fish weight must be greater than 0", "FF-022");
            }
            if (new Date(input.datePeche) > new Date()) {
                businessError("Fishing date cannot be in the future", "FF-023");
            }

            return context.prisma.logEntry.create({
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
        },

        deleteLogEntry: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            const logEntry = await context.prisma.logEntry.findFirst({
                where: { id, deleted_at: null }
            });

            if (!logEntry) {
                businessError("Log entry not found", "FF-024");
            }

            await context.prisma.logEntry.update({
                where: { id },
                data: {
                    deleted_at: new Date(),
                    deleted_by: "system"
                }
            });

            return true;
        }
    },

    // ========================================================================
    // TYPE RESOLVERS (camelCase mapping + relations)
    // ========================================================================

    User: {
        dateNaissance: (parent: User) => parent.date_naissance,
        codePostal: (parent: User) => parent.code_postal,
        photoUrl: (parent: User) => parent.photo_url,
        typeActivite: (parent: User) => parent.type_activite,
        permisBateau: (parent: User) => parent.permis_bateau,

        boats: (parent: User, _args: EmptyArgs, context: Context) =>
            context.prisma.boat.findMany({ where: { user_id: parent.id, deleted_at: null } }),
        trips: (parent: User, _args: EmptyArgs, context: Context) =>
            context.prisma.trip.findMany({ where: { owner_id: parent.id, deleted_at: null } }),
        bookings: (parent: User, _args: EmptyArgs, context: Context) =>
            context.prisma.booking.findMany({ where: { user_id: parent.id, deleted_at: null } }),
        logEntries: (parent: User, _args: EmptyArgs, context: Context) =>
            context.prisma.logEntry.findMany({ where: { owner_id: parent.id, deleted_at: null } }),
    },

    Boat: {
        photoUrl: (parent: Boat) => parent.photo_url,
        permisRequis: (parent: Boat) => parent.permis_requis,
        cautionEur: (parent: Boat) => Number(parent.caution_eur),
        capaciteMax: (parent: Boat) => parent.capacite_max,
        portAttacheVille: (parent: Boat) => parent.port_attache_ville,
        puissanceCv: (parent: Boat) => parent.puissance_cv,
        lat: (parent: Boat) => Number(parent.lat),
        lon: (parent: Boat) => Number(parent.lon),

        owner: (parent: Boat, _args: EmptyArgs, context: Context) =>
            context.prisma.user.findFirst({ where: { id: parent.user_id, deleted_at: null } }),
        trips: (parent: Boat, _args: EmptyArgs, context: Context) =>
            context.prisma.trip.findMany({ where: { boat_id: parent.id, deleted_at: null } }),
    },

    Trip: {
        infosPratiques: (parent: Trip) => parent.infos_pratiques,
        typeSortie: (parent: Trip) => parent.type_sortie,
        typeTarif: (parent: Trip) => parent.type_tarif,
        nbPassagers: (parent: Trip) => parent.nb_passagers,
        prixEur: (parent: Trip) => Number(parent.prix_eur),

        owner: (parent: Trip, _args: EmptyArgs, context: Context) =>
            context.prisma.user.findFirst({ where: { id: parent.owner_id, deleted_at: null } }),
        boat: (parent: Trip, _args: EmptyArgs, context: Context) =>
            context.prisma.boat.findFirst({ where: { id: parent.boat_id, deleted_at: null } }),
        occurrences: (parent: Trip, _args: EmptyArgs, context: Context) =>
            context.prisma.occurrence.findMany({ where: { trip_id: parent.id } }),
        bookings: (parent: Trip, _args: EmptyArgs, context: Context) =>
            context.prisma.booking.findMany({ where: { trip_id: parent.id, deleted_at: null } }),
    },

    Occurrence: {
        dateDebut: (parent: Occurrence) => parent.date_debut,
        dateFin: (parent: Occurrence) => parent.date_fin,
        heureDepart: (parent: Occurrence) => parent.heure_depart,
        heureFin: (parent: Occurrence) => parent.heure_fin,

        trip: (parent: Occurrence, _args: EmptyArgs, context: Context) =>
            context.prisma.trip.findFirst({ where: { id: parent.trip_id, deleted_at: null } }),
        bookings: (parent: Occurrence, _args: EmptyArgs, context: Context) =>
            context.prisma.booking.findMany({ where: { occurrence_id: parent.id, deleted_at: null } }),
    },

    Booking: {
        dateRetenue: (parent: Booking) => parent.date_retenue,
        nbPlaces: (parent: Booking) => parent.nb_places,
        prixTotalEur: (parent: Booking) => Number(parent.prix_total_eur),

        trip: (parent: Booking, _args: EmptyArgs, context: Context) =>
            context.prisma.trip.findFirst({ where: { id: parent.trip_id, deleted_at: null } }),
        user: (parent: Booking, _args: EmptyArgs, context: Context) =>
            context.prisma.user.findFirst({ where: { id: parent.user_id, deleted_at: null } }),
        occurrence: (parent: Booking, _args: EmptyArgs, context: Context) =>
            context.prisma.occurrence.findUnique({ where: { id: parent.occurrence_id } }),
    },

    LogEntry: {
        poissonNom: (parent: LogEntry) => parent.poisson_nom,
        photoUrl: (parent: LogEntry) => parent.photo_url,
        tailleCm: (parent: LogEntry) => Number(parent.taille_cm),
        poidsKg: (parent: LogEntry) => Number(parent.poids_kg),
        datePeche: (parent: LogEntry) => parent.date_peche,

        owner: (parent: LogEntry, _args: EmptyArgs, context: Context) =>
            context.prisma.user.findFirst({ where: { id: parent.owner_id, deleted_at: null } }),
    }
};
