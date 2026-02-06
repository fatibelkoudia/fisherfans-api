const fs = require("node:fs");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

function resolveDatabaseUrl() {
  const inDocker = fs.existsSync("/.dockerenv");
  const configuredUrl = process.env.DATABASE_URL;

  if (configuredUrl) {
    if (!inDocker && configuredUrl.includes("@postgres:")) {
      return configuredUrl.replace("@postgres:", "@localhost:");
    }

    return configuredUrl;
  }

  const user = process.env.POSTGRES_USER || "postgres";
  const password = process.env.POSTGRES_PASSWORD || "postgres";
  const db = process.env.POSTGRES_DB || "postgres";
  const host = inDocker ? "postgres" : "localhost";

  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:5432/${db}?schema=public`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});

const seedPassword = "FisherFans123!";
const seedPasswordHash = bcrypt.hashSync(seedPassword, 10);

const baseUsers = [
  {
    id: "9dc8ddf0-898b-471c-a4ab-79df1764f7a1",
    nom: "Leclerc",
    prenom: "Martin",
    date_naissance: new Date("1987-05-21T00:00:00.000Z"),
    email: "martin.leclerc@fisherfans.test",
    telephone: "+33600000001",
    adresse: "12 quai des pecheurs",
    code_postal: "13002",
    ville: "Marseille",
    langues: ["fr", "en"],
    statut: "professionnel",
    societe: "Mediterranee Fishing",
    type_activite: "guide",
    siret: "12345678901234",
    rc: "RC-MED-2026",
    // Must be 8 chars to satisfy BR-B1 (BF27) in userService.hasValidBoatLicense()
    permis_bateau: "12345678",
    assurance: "AXA123456789",
  },
  {
    id: "14e7a6ed-9f0f-47cb-bf58-a044f17b0b66",
    nom: "Moreau",
    prenom: "Sophie",
    date_naissance: new Date("1990-11-03T00:00:00.000Z"),
    email: "sophie.moreau@fisherfans.test",
    telephone: "+33600000002",
    adresse: "4 rue du vieux port",
    code_postal: "17000",
    ville: "La Rochelle",
    langues: ["fr"],
    statut: "professionnel",
    societe: "Atlantic Boats",
    type_activite: "location",
    siret: "22345678901234",
    rc: "RC-ATL-2026",
    permis_bateau: "23456789",
    assurance: "ALL123456789",
  },
  {
    id: "2afc9f7e-0abf-4997-bf7d-ec873de0ac6f",
    nom: "Bernard",
    prenom: "Lucie",
    date_naissance: new Date("1996-08-14T00:00:00.000Z"),
    email: "lucie.bernard@fisherfans.test",
    telephone: "+33600000003",
    adresse: "18 avenue des dunes",
    code_postal: "33260",
    ville: "La Teste-de-Buch",
    langues: ["fr", "es"],
    statut: "particulier",
  },
  {
    id: "27dc5eb8-9c85-41d9-94ca-0af322ec2c04",
    nom: "Petit",
    prenom: "Hugo",
    date_naissance: new Date("1994-01-30T00:00:00.000Z"),
    email: "hugo.petit@fisherfans.test",
    telephone: "+33600000004",
    adresse: "9 chemin des falaises",
    code_postal: "56340",
    ville: "Carnac",
    langues: ["fr", "en"],
    statut: "particulier",
  },
  {
    id: "c6f5b6da-7ad3-4d56-9c4b-2eb84f4f34c3",
    nom: "Rivière",
    prenom: "Emma",
    date_naissance: new Date("1985-03-14T00:00:00.000Z"),
    email: "emma.riviere@fisherfans.test",
    telephone: "+33600000005",
    adresse: "25 rue des calanques",
    code_postal: "13007",
    ville: "Marseille",
    langues: ["fr", "en"],
    statut: "professionnel",
    societe: "Calanques Charter",
    type_activite: "location",
    siret: "32345678901234",
    rc: "RC-CAL-2026",
    permis_bateau: "34567890",
    assurance: "MAIF12345678",
  },
  {
    id: "a1a6df0b-ff8e-4f30-8b20-0f1b3970a1c8",
    nom: "Fernandez",
    prenom: "Julien",
    date_naissance: new Date("1992-04-08T00:00:00.000Z"),
    email: "julien.fernandez@fisherfans.test",
    telephone: "+33600000006",
    adresse: "7 boulevard des mers",
    code_postal: "06000",
    ville: "Nice",
    langues: ["fr", "en", "it"],
    statut: "particulier",
  },
  //   lists + auth + license rules
  {
    id: "8b37b74a-6e48-4e64-93a0-24a3a1c25f45",
    nom: "Durand",
    prenom: "Camille",
    date_naissance: new Date("1991-02-11T00:00:00.000Z"),
    email: "camille.durand@fisherfans.test",
    telephone: "+33600000007",
    adresse: "3 rue des Quais",
    code_postal: "06000",
    ville: "Nice",
    langues: ["fr", "en"],
    statut: "professionnel",
    societe: "Azur Fishing Trips",
    type_activite: "guide",
    siret: "42345678901234",
    rc: "RC-AZU-2026",
    permis_bateau: "45678901",
    assurance: "GMF123456789",
  },
  {
    id: "b0f2a8a8-16c8-4d66-bb3a-4f6f0f64c3c0",
    nom: "Nguyen",
    prenom: "Linh",
    date_naissance: new Date("1993-09-09T00:00:00.000Z"),
    email: "linh.nguyen@fisherfans.test",
    telephone: "+33600000008",
    adresse: "21 avenue du Port",
    code_postal: "33000",
    ville: "Bordeaux",
    langues: ["fr"],
    statut: "particulier",
    permis_bateau: "56789012",
  },
  {
    id: "c3d7c7b3-8a9f-44e3-9bb8-0f1cf34a1c0d",
    nom: "Lemaire",
    prenom: "Thomas",
    date_naissance: new Date("1989-12-01T00:00:00.000Z"),
    email: "thomas.lemaire@fisherfans.test",
    telephone: "+33600000009",
    adresse: "8 impasse des Iles",
    code_postal: "35800",
    ville: "Dinard",
    langues: ["fr", "en"],
    statut: "particulier",
  },
  {
    id: "de3a1d74-7b1b-4f1b-a1d4-9a2f07d0a9b1",
    nom: "Garcia",
    prenom: "Ines",
    date_naissance: new Date("1998-06-22T00:00:00.000Z"),
    email: "ines.garcia@fisherfans.test",
    telephone: "+33600000010",
    adresse: "15 rue des Marees",
    code_postal: "17000",
    ville: "La Rochelle",
    langues: ["fr", "es"],
    statut: "professionnel",
    societe: "Ocean Rentals",
    type_activite: "location",
    siret: "52345678901234",
    rc: "RC-OCE-2026",
    permis_bateau: "67890123", // Must be 8 chars to satisfy BR-B1
    assurance: "MAC123456789",
  },
];

const users = baseUsers.map((user) => ({
  ...user,
  password_hash: seedPasswordHash,
}));

function assertMaxLen({ label, value, max, user }) {
  if (value == null) return;
  if (typeof value !== "string") {
    throw new Error(`[seed] ${label} must be a string (got ${typeof value}) for user ${user.email}`);
  }
  if (value.length > max) {
    throw new Error(
      `[seed] ${label} too long for user ${user.email} (${user.id}): length=${value.length}, max=${max}, value="${value}"`
    );
  }
}

function validateUsers(usersToValidate) {
  for (const user of usersToValidate) {
    assertMaxLen({ label: "permis_bateau", value: user.permis_bateau, max: 8, user });
    assertMaxLen({ label: "assurance", value: user.assurance, max: 12, user });
  }
}

const boats = [
  {
    id: "dc87cbd5-5dbb-489e-b500-f539fca173f6",
    user_id: "9dc8ddf0-898b-471c-a4ab-79df1764f7a1",
    nom: "Blue Runner",
    description: "Bateau de peche sportive equipe GPS et sondeur.",
    marque: "Beneteau",
    annee: 2020,
    photo_url: "https://images.fisherfans.test/boats/blue-runner.jpg",
    permis_requis: "cotier",
    type: "open",
    equipements: ["GPS", "sondeur", "gilets", "canne"],
    caution_eur: "1500.00",
    capacite_max: 6,
    couchages: 0,
    port_attache_ville: "Marseille",
    lat: "43.296482",
    lon: "5.369780",
    motorisation: "hors-bord",
    puissance_cv: 200,
  },
  {
    id: "eb19016b-c97a-46d5-a4f5-3590df66fc6b",
    user_id: "14e7a6ed-9f0f-47cb-bf58-a044f17b0b66",
    nom: "Atlantic Wind",
    description: "Voilier confortable pour sorties de demi-journee.",
    marque: "Jeanneau",
    annee: 2018,
    photo_url: "https://images.fisherfans.test/boats/atlantic-wind.jpg",
    permis_requis: "cotier",
    type: "voilier",
    equipements: ["VHF", "sondeur", "gilets"],
    caution_eur: "2200.00",
    capacite_max: 8,
    couchages: 4,
    port_attache_ville: "La Rochelle",
    lat: "46.160329",
    lon: "-1.151139",
    motorisation: "inboard diesel",
    puissance_cv: 80,
  },
  {
    id: "4b428054-6e87-4e41-9d1f-3d2f2ef29a07",
    user_id: "c6f5b6da-7ad3-4d56-9c4b-2eb84f4f34c3",
    nom: "Calanque Whisper",
    description: "Catamaran de luxe pour balades en fin de journee.",
    marque: "Lagoon",
    annee: 2022,
    photo_url: "https://images.fisherfans.test/boats/calanque-whisper.jpg",
    permis_requis: "cotier",
    type: "catamaran",
    equipements: ["salon exterieur", "bar", "balise", "gilets"],
    caution_eur: "3200.00",
    capacite_max: 12,
    couchages: 6,
    port_attache_ville: "Marseille",
    lat: "43.203283",
    lon: "5.595325",
    motorisation: "inboard diesel",
    puissance_cv: 220,
  },
  //   lists + auth + license rules
  {
    id: "89375514-79ed-4bf0-a89b-e5afa0373ea6",
    user_id: "8b37b74a-6e48-4e64-93a0-24a3a1c25f45",
    nom: "Azur Skiff",
    description: "Bateau leger ideal pour sorties rapides autour de Nice.",
    marque: "Quicksilver",
    annee: 2019,
    photo_url: "https://images.fisherfans.test/boats/azur-skiff.jpg",
    permis_requis: "cotier",
    type: "open",
    equipements: ["GPS", "vhf", "gilets"],
    caution_eur: "900.00",
    capacite_max: 5,
    couchages: 0,
    port_attache_ville: "Nice",
    lat: "43.703468",
    lon: "7.266557",
    motorisation: "hors-bord",
    puissance_cv: 115,
  },
  {
    id: "1d2c1e08-2b0b-4d7b-8f02-6a70d9422c7b",
    user_id: "de3a1d74-7b1b-4f1b-a1d4-9a2f07d0a9b1",
    nom: "Ocean Sprint",
    description: "Semi-rigide pour location a la journee au depart de La Rochelle.",
    marque: "Zodiac",
    annee: 2021,
    photo_url: "https://images.fisherfans.test/boats/ocean-sprint.jpg",
    permis_requis: "cotier",
    type: "open",
    equipements: ["vhf", "gilets", "sondeur"],
    caution_eur: "1100.00",
    capacite_max: 7,
    couchages: 0,
    port_attache_ville: "La Rochelle",
    lat: "46.160000",
    lon: "-1.151000",
    motorisation: "hors-bord",
    puissance_cv: 140,
  },
];

const trips = [
  {
    id: "7cc5f17d-101c-4581-84cf-81a1f9f8e45d",
    owner_id: "9dc8ddf0-898b-471c-a4ab-79df1764f7a1",
    boat_id: "dc87cbd5-5dbb-489e-b500-f539fca173f6",
    titre: "Peche sportive au large de Marseille",
    infos_pratiques: "Rendez-vous 30 min avant le depart au Vieux-Port.",
    type_sortie: "journaliere",
    type_tarif: "par_personne",
    nb_passagers: 4,
    prix_eur: "95.00",
  },
  {
    id: "862d29e5-f8df-45fa-a1aa-f8b0d1c2ec9e",
    owner_id: "14e7a6ed-9f0f-47cb-bf58-a044f17b0b66",
    boat_id: "eb19016b-c97a-46d5-a4f5-3590df66fc6b",
    titre: "Sortie voilier et initiation peche",
    infos_pratiques: "Materiel fourni, tenue chaude recommandee.",
    type_sortie: "recurrente",
    type_tarif: "global",
    nb_passagers: 6,
    prix_eur: "420.00",
  },
  {
    id: "f3a1b480-8c9e-4dc7-9f53-29dc3b1aad41",
    owner_id: "c6f5b6da-7ad3-4d56-9c4b-2eb84f4f34c3",
    boat_id: "4b428054-6e87-4e41-9d1f-3d2f2ef29a07",
    titre: "Balade coucher de soleil dans les calanques",
    infos_pratiques: "Rendez-vous a l'embarcadere de l'Estaque, prevoir une veste.",
    type_sortie: "journaliere",
    type_tarif: "global",
    nb_passagers: 10,
    prix_eur: "760.00",
  },
];

const occurrences = [
  {
    id: "7aee44bc-00e5-4703-b9e5-af66de8c294f",
    trip_id: "7cc5f17d-101c-4581-84cf-81a1f9f8e45d",
    date_debut: new Date("2026-06-10T07:00:00.000Z"),
    date_fin: new Date("2026-06-10T12:00:00.000Z"),
    heure_depart: new Date("2026-06-10T07:00:00.000Z"),
    heure_fin: new Date("2026-06-10T12:00:00.000Z"),
  },
  {
    id: "d959cd4a-6c9d-42bf-be0f-c876763abec8",
    trip_id: "7cc5f17d-101c-4581-84cf-81a1f9f8e45d",
    date_debut: new Date("2026-06-17T07:00:00.000Z"),
    date_fin: new Date("2026-06-17T12:00:00.000Z"),
    heure_depart: new Date("2026-06-17T07:00:00.000Z"),
    heure_fin: new Date("2026-06-17T12:00:00.000Z"),
  },
  {
    id: "3ee54a88-3639-4d03-a890-2ca90eb0ca82",
    trip_id: "862d29e5-f8df-45fa-a1aa-f8b0d1c2ec9e",
    date_debut: new Date("2026-06-14T08:00:00.000Z"),
    date_fin: new Date("2026-06-14T13:00:00.000Z"),
    heure_depart: new Date("2026-06-14T08:00:00.000Z"),
    heure_fin: new Date("2026-06-14T13:00:00.000Z"),
  },
  {
    id: "5f2a1ad6-7d6a-48d6-9be5-0e3ad6f048c3",
    trip_id: "f3a1b480-8c9e-4dc7-9f53-29dc3b1aad41",
    date_debut: new Date("2026-07-01T18:30:00.000Z"),
    date_fin: new Date("2026-07-01T21:30:00.000Z"),
    heure_depart: new Date("2026-07-01T18:30:00.000Z"),
    heure_fin: new Date("2026-07-01T21:30:00.000Z"),
  },
  {
    id: "21bc3d57-62a5-482a-8d48-fc5a9a7a63d9",
    trip_id: "f3a1b480-8c9e-4dc7-9f53-29dc3b1aad41",
    date_debut: new Date("2026-07-08T18:30:00.000Z"),
    date_fin: new Date("2026-07-08T21:30:00.000Z"),
    heure_depart: new Date("2026-07-08T18:30:00.000Z"),
    heure_fin: new Date("2026-07-08T21:30:00.000Z"),
  },
];

const bookings = [
  {
    id: "6eb489b9-7f68-4d09-ab2d-96b2af9d10ef",
    trip_id: "7cc5f17d-101c-4581-84cf-81a1f9f8e45d",
    user_id: "2afc9f7e-0abf-4997-bf7d-ec873de0ac6f",
    occurrence_id: "7aee44bc-00e5-4703-b9e5-af66de8c294f",
    date_retenue: new Date("2026-05-28T12:00:00.000Z"),
    nb_places: 2,
    prix_total_eur: "190.00",
  },
  {
    id: "2f3af1de-f149-44d4-bec0-8f9da6cbd03e",
    trip_id: "862d29e5-f8df-45fa-a1aa-f8b0d1c2ec9e",
    user_id: "27dc5eb8-9c85-41d9-94ca-0af322ec2c04",
    occurrence_id: "3ee54a88-3639-4d03-a890-2ca90eb0ca82",
    date_retenue: new Date("2026-05-30T17:30:00.000Z"),
    nb_places: 1,
    prix_total_eur: "420.00",
  },
  {
    id: "d16890f4-f3df-4182-9ce8-64f06c3eaebc",
    trip_id: "f3a1b480-8c9e-4dc7-9f53-29dc3b1aad41",
    user_id: "a1a6df0b-ff8e-4f30-8b20-0f1b3970a1c8",
    occurrence_id: "5f2a1ad6-7d6a-48d6-9be5-0e3ad6f048c3",
    date_retenue: new Date("2026-06-25T15:00:00.000Z"),
    nb_places: 4,
    prix_total_eur: "760.00",
  },
];

const logEntries = [
  {
    id: "84f95ee5-8a6f-48f4-a041-1387f8d9ca2e",
    owner_id: "2afc9f7e-0abf-4997-bf7d-ec873de0ac6f",
    poisson_nom: "Bar",
    photo_url: "https://images.fisherfans.test/catches/bar-01.jpg",
    commentaire: "Pris en traine au lever du soleil.",
    taille_cm: "54.20",
    poids_kg: "2.35",
    lieu: "Baie de Marseille",
    date_peche: new Date("2026-05-10T06:45:00.000Z"),
    relache: true,
  },
  {
    id: "282f536e-f329-45df-8fca-54d337810f8b",
    owner_id: "27dc5eb8-9c85-41d9-94ca-0af322ec2c04",
    poisson_nom: "Dorade",
    photo_url: "https://images.fisherfans.test/catches/dorade-01.jpg",
    commentaire: "Premiere prise en mer avec equipage.",
    taille_cm: "41.00",
    poids_kg: "1.20",
    lieu: "Pertuis d'Antioche",
    date_peche: new Date("2026-05-18T09:20:00.000Z"),
    relache: false,
  },
  {
    id: "c4ad5b6b-2d8e-4c2b-9c5b-7c4f1b9ab182",
    owner_id: "a1a6df0b-ff8e-4f30-8b20-0f1b3970a1c8",
    poisson_nom: "Daurade royal",
    photo_url: "https://images.fisherfans.test/catches/daurade-royale.jpg",
    commentaire: "Promenade au coucher du soleil, prise sur calmar en surface.",
    taille_cm: "47.80",
    poids_kg: "1.90",
    lieu: "Calanque de Sormiou",
    date_peche: new Date("2026-07-02T20:10:00.000Z"),
    relache: true,
  },
];

async function main() {
  console.log("Resetting and seeding deterministic dataset...");

  await prisma.$transaction([
    prisma.booking.deleteMany(),
    prisma.occurrence.deleteMany(),
    prisma.trip.deleteMany(),
    prisma.logEntry.deleteMany(),
    prisma.boat.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  validateUsers(users);

  // Create users one-by-one to make seed errors actionable (Prisma createMany doesn't surface which row/column failed).
  for (const user of users) {
    try {
      await prisma.user.create({ data: user });
    } catch (error) {
      console.error("[seed] Failed to create user:", { id: user.id, email: user.email });
      throw error;
    }
  }

  await prisma.boat.createMany({ data: boats });
  await prisma.trip.createMany({ data: trips });
  await prisma.occurrence.createMany({ data: occurrences });
  await prisma.booking.createMany({ data: bookings });
  await prisma.logEntry.createMany({ data: logEntries });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
