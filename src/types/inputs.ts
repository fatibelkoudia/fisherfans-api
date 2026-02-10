import { UserStatus, UserActivityType, PermitType, BoatType, TripType, TripPricingType } from "@prisma/client";

export interface CreateUserInput {
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
    password: string;
}

export interface UpdateUserInput {
    nom?: string;
    prenom?: string;
    dateNaissance?: Date;
    email?: string;
    telephone?: string;
    adresse?: string;
    codePostal?: string;
    ville?: string;
    langues?: string[];
    photoUrl?: string | null;
    statut?: UserStatus;
    societe?: string | null;
    typeActivite?: UserActivityType | null;
    siret?: string | null;
    rc?: string | null;
    permisBateau?: string | null;
    assurance?: string | null;
    password?: string;
}

export interface CreateBoatInput {
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
}

export interface CreateTripInput {
    boatId: string;
    titre: string;
    infosPratiques?: string | null;
    typeSortie: TripType;
    typeTarif: TripPricingType;
    nbPassagers: number;
    prixEur: number;
}

export interface CreateOccurrenceInput {
    tripId: string;
    dateDebut: Date;
    dateFin: Date;
    heureDepart: Date;
    heureFin: Date;
}

export interface CreateBookingInput {
    tripId: string;
    occurrenceId: string;
    nbPlaces: number;
}

export interface CreateLogEntryInput {
    poissonNom: string;
    photoUrl?: string | null;
    commentaire?: string | null;
    tailleCm: number;
    poidsKg: number;
    lieu: string;
    datePeche: Date;
    relache: boolean;
}

export interface BBox {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

export interface LoginInput {
    email: string;
    password: string;
}
