-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('particulier', 'professionnel');

-- CreateEnum
CREATE TYPE "UserActivityType" AS ENUM ('location', 'guide');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('cotier', 'fluvial');

-- CreateEnum
CREATE TYPE "BoatType" AS ENUM ('open', 'cabine', 'catamaran', 'voilier', 'jetski', 'canoe');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('journaliere', 'recurrente');

-- CreateEnum
CREATE TYPE "TripPricingType" AS ENUM ('global', 'par_personne');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "code_postal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "langues" TEXT[],
    "photo_url" TEXT,
    "statut" "UserStatus" NOT NULL,
    "societe" TEXT,
    "type_activite" "UserActivityType",
    "siret" TEXT,
    "rc" TEXT,
    "permis_bateau" VARCHAR(8),
    "assurance" VARCHAR(12),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "marque" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "photo_url" TEXT,
    "permis_requis" "PermitType" NOT NULL,
    "type" "BoatType" NOT NULL,
    "equipements" TEXT[],
    "caution_eur" DECIMAL(10,2) NOT NULL,
    "capacite_max" INTEGER NOT NULL,
    "couchages" INTEGER NOT NULL,
    "port_attache_ville" TEXT NOT NULL,
    "lat" DECIMAL(9,6) NOT NULL,
    "lon" DECIMAL(9,6) NOT NULL,
    "motorisation" TEXT NOT NULL,
    "puissance_cv" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "boats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "boat_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "infos_pratiques" TEXT,
    "type_sortie" "TripType" NOT NULL,
    "type_tarif" "TripPricingType" NOT NULL,
    "nb_passagers" INTEGER NOT NULL,
    "prix_eur" DECIMAL(10,2) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occurrences" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "heure_depart" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "date_retenue" TIMESTAMP(3) NOT NULL,
    "nb_places" INTEGER NOT NULL,
    "prix_total_eur" DECIMAL(10,2) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_entries" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "poisson_nom" TEXT NOT NULL,
    "photo_url" TEXT,
    "commentaire" TEXT,
    "taille_cm" DECIMAL(5,2) NOT NULL,
    "poids_kg" DECIMAL(5,2) NOT NULL,
    "lieu" TEXT NOT NULL,
    "date_peche" TIMESTAMP(3) NOT NULL,
    "relache" BOOLEAN NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "boats_lat_lon_idx" ON "boats"("lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_trip_id_user_id_occurrence_id_key" ON "bookings"("trip_id", "user_id", "occurrence_id");

-- AddForeignKey
ALTER TABLE "boats" ADD CONSTRAINT "boats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_boat_id_fkey" FOREIGN KEY ("boat_id") REFERENCES "boats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
