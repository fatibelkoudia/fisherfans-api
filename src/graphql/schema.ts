import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Scalars
  scalar DateTime

  # Enums
  enum UserStatus {
    particulier
    professionnel
  }

  enum UserActivityType {
    location
    guide
  }

  enum PermitType {
    cotier
    fluvial
  }

  enum BoatType {
    open
    cabine
    catamaran
    voilier
    jetski
    canoe
  }

  enum TripType {
    journaliere
    recurrente
  }

  enum TripPricingType {
    global
    par_personne
  }

  # Models

  type User {
    id: ID!
    nom: String!
    prenom: String!
    dateNaissance: DateTime!
    email: String!
    telephone: String!
    adresse: String!
    codePostal: String!
    ville: String!
    langues: [String!]!
    photoUrl: String
    statut: UserStatus!
    societe: String
    typeActivite: UserActivityType
    siret: String
    rc: String
    permisBateau: String
    assurance: String
    
    # Relations
    boats: [Boat!]!
    trips: [Trip!]!
    bookings: [Booking!]!
    logEntries: [LogEntry!]!
  }

  type Boat {
    id: ID!
    nom: String!
    description: String
    marque: String!
    annee: Int!
    photoUrl: String
    permisRequis: PermitType!
    type: BoatType!
    equipements: [String!]!
    cautionEur: Float!
    capaciteMax: Int!
    couchages: Int!
    portAttacheVille: String!
    lat: Float!
    lon: Float!
    motorisation: String!
    puissanceCv: Int!

    # Relations
    owner: User!
    trips: [Trip!]!
  }

  type Trip {
    id: ID!
    titre: String!
    infosPratiques: String
    typeSortie: TripType!
    typeTarif: TripPricingType!
    nbPassagers: Int!
    prixEur: Float!

    # Relations
    owner: User!
    boat: Boat!
    occurrences: [Occurrence!]!
    bookings: [Booking!]!
  }

  type Occurrence {
    id: ID!
    dateDebut: DateTime!
    dateFin: DateTime!
    heureDepart: DateTime!
    heureFin: DateTime!

    # Relations
    trip: Trip!
    bookings: [Booking!]!
  }

  type Booking {
    id: ID!
    dateRetenue: DateTime!
    nbPlaces: Int!
    prixTotalEur: Float!

    # Relations
    trip: Trip!
    user: User!
    occurrence: Occurrence!
  }

  type LogEntry {
    id: ID!
    poissonNom: String!
    photoUrl: String
    commentaire: String
    tailleCm: Float!
    poidsKg: Float!
    lieu: String!
    datePeche: DateTime!
    relache: Boolean!

    # Relations
    owner: User!
  }

  # Input Types
  input CreateUserInput {
    nom: String!
    prenom: String!
    dateNaissance: DateTime!
    email: String!
    telephone: String!
    adresse: String!
    codePostal: String!
    ville: String!
    langues: [String!]!
    photoUrl: String
    statut: UserStatus!
    # Professional fields (required if statut = professionnel)
    societe: String
    typeActivite: UserActivityType
    siret: String
    rc: String
    # Optional license fields
    permisBateau: String
    assurance: String
    password: String!
  }

  input CreateBoatInput {
    nom: String!
    description: String
    marque: String!
    annee: Int!
    photoUrl: String
    permisRequis: PermitType!
    type: BoatType!
    equipements: [String!]!
    cautionEur: Float!
    capaciteMax: Int!
    couchages: Int!
    portAttacheVille: String!
    lat: Float!
    lon: Float!
    motorisation: String!
    puissanceCv: Int!
  }

  input CreateTripInput {
    boatId: ID!
    titre: String!
    infosPratiques: String
    typeSortie: TripType!
    typeTarif: TripPricingType!
    nbPassagers: Int!
    prixEur: Float!
  }

  input CreateOccurrenceInput {
    tripId: ID!
    dateDebut: DateTime!
    dateFin: DateTime!
    heureDepart: DateTime!
    heureFin: DateTime!
  }

  input CreateBookingInput {
    tripId: ID!
    occurrenceId: ID!
    nbPlaces: Int!
  }

  input CreateLogEntryInput {
    poissonNom: String!
    photoUrl: String
    commentaire: String
    tailleCm: Float!
    poidsKg: Float!
    lieu: String!
    datePeche: DateTime!
    relache: Boolean!
  }

  input BoundingBoxInput {
    minLat: Float!
    maxLat: Float!
    minLon: Float!
    maxLon: Float!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Root Types
  type Query {
    # Users
    users: [User!]!
    user(id: ID!): User
    me: User!

    # Boats
    boats: [Boat!]!
    boat(id: ID!): Boat
    boatsByLocation(bbox: BoundingBoxInput!): [Boat!]!

    # Trips
    trips: [Trip!]!
    trip(id: ID!): Trip
    
    # Logs
    logEntries: [LogEntry!]!
    logEntry(id: ID!): LogEntry
  }

  type Mutation {
    # Users
    signup(input: CreateUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createUser(input: CreateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Boats
    createBoat(userId: ID!, input: CreateBoatInput!): Boat!
    deleteBoat(id: ID!): Boolean!

    # Trips
    createTrip(userId: ID!, input: CreateTripInput!): Trip!
    deleteTrip(id: ID!): Boolean!

    # Occurrences
    createOccurrence(input: CreateOccurrenceInput!): Occurrence!

    # Bookings
    createBooking(userId: ID!, input: CreateBookingInput!): Booking!
    deleteBooking(id: ID!): Boolean!

    # Log Entries
    createLogEntry(userId: ID!, input: CreateLogEntryInput!): LogEntry!
    deleteLogEntry(id: ID!): Boolean!
  }
`;
