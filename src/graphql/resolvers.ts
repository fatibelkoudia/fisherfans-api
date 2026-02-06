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
import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import { BusinessError, businessError } from "../utils/errors";
import {
    CreateUserInput,
    CreateBoatInput,
    CreateTripInput,
    CreateOccurrenceInput,
    CreateBookingInput,
    CreateLogEntryInput,
    BBox,
    LoginInput
} from "../types/inputs";

type EmptyArgs = Record<string, never>;
type IdArgs = { id: string };
type BBoxArgs = { bbox: BBox };

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
            return context.services.user.findAll();
        },
        user: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.services.user.findById(id);
        },

        me: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            try {
                if (!context.user) {
                    businessError("Authentication required", "FF-401");
                }

                const user = await context.services.user.findById(context.user.id);

                if (!user) {
                    businessError("Authenticated user not found", "FF-007");
                }

                return user;
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // Boats
        boats: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.services.boat.findAll();
        },
        boat: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.services.boat.findById(id);
        },

        // BR-G1: Bounding box search for boats (BF24)
        boatsByLocation: async (_parent: unknown, { bbox }: BBoxArgs, context: Context) => {
            try {
                return await context.services.boat.findByLocation(bbox);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // Trips
        trips: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.services.trip.findAll();
        },
        trip: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.services.trip.findById(id);
        },

        // Log Entries
        logEntries: async (_parent: unknown, _args: EmptyArgs, context: Context) => {
            return context.services.logEntry.findAll();
        },
        logEntry: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            return context.services.logEntry.findById(id);
        }
    },

    // ========================================================================
    // MUTATIONS
    // ========================================================================

    Mutation: {
        // -------------------------------------------------------------------
        // USER MUTATIONS
        // -------------------------------------------------------------------

        signup: async (_parent: unknown, { input }: { input: CreateUserInput }, context: Context) => {
            try {
                return await context.services.auth.signup(input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        login: async (_parent: unknown, { input }: { input: LoginInput }, context: Context) => {
            try {
                return await context.services.auth.login(input.email, input.password);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        createUser: async (_parent: unknown, { input }: { input: CreateUserInput }, context: Context) => {
            try {
                return await context.services.user.create(input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        deleteUser: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            try {
                return await context.services.user.delete(id);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // -------------------------------------------------------------------
        // BOAT MUTATIONS
        // -------------------------------------------------------------------

        createBoat: async (_parent: unknown, { userId, input }: { userId: string; input: CreateBoatInput }, context: Context) => {
            try {
                return await context.services.boat.create(context, userId, input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        deleteBoat: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            try {
                return await context.services.boat.delete(context, id);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // -------------------------------------------------------------------
        // TRIP MUTATIONS
        // -------------------------------------------------------------------

        createTrip: async (_parent: unknown, { userId, input }: { userId: string; input: CreateTripInput }, context: Context) => {
            try {
                return await context.services.trip.create(context, userId, input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        deleteTrip: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            try {
                return await context.services.trip.delete(context, id);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // -------------------------------------------------------------------
        // OCCURRENCE MUTATIONS
        // -------------------------------------------------------------------

        createOccurrence: async (_parent: unknown, { input }: { input: CreateOccurrenceInput }, context: Context) => {
            try {
                return await context.services.occurrence.create(input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // -------------------------------------------------------------------
        // BOOKING MUTATIONS
        // -------------------------------------------------------------------

        createBooking: async (_parent: unknown, { userId, input }: { userId: string; input: CreateBookingInput }, context: Context) => {
            try {
                return await context.services.booking.create(context, userId, input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        deleteBooking: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            try {
                return await context.services.booking.delete(context, id);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        // -------------------------------------------------------------------
        // LOG ENTRY MUTATIONS
        // -------------------------------------------------------------------

        createLogEntry: async (_parent: unknown, { userId, input }: { userId: string; input: CreateLogEntryInput }, context: Context) => {
            try {
                return await context.services.logEntry.create(context, userId, input);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
        },

        deleteLogEntry: async (_parent: unknown, { id }: IdArgs, context: Context) => {
            try {
                return await context.services.logEntry.delete(context, id);
            } catch (error) {
                if (error instanceof BusinessError) {
                    throw error.toGraphQLError();
                }
                throw error;
            }
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
