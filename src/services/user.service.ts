import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateUserInput, UpdateUserInput } from "../types/inputs";
import { businessError } from "../utils/errors";
import { requireAuth } from "../utils/auth";
import type { Context } from "../context";

export class UserService extends BaseService {
    /**
     * Get all non-deleted users
     */
    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { deleted_at: null }
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { id, deleted_at: null }
        });
    }

    /**
     * Create a new user with business rule validation
     */
    async create(input: CreateUserInput): Promise<User> {
        // BR-U2: Professional user constraints
        this.validateProfessionalUser(input);

        // BR-U3: Unique email validation
        await this.validateUniqueEmail(input.email);

        const passwordHash = await this.hashPassword(input.password);

        return this.prisma.user.create({
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
                assurance: input.assurance,
                password_hash: passwordHash
            }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email, deleted_at: null }
        });
    }

    /**
     * Update an existing user (authenticated user only)
     */
    async update(ctx: Context, id: string, input: UpdateUserInput): Promise<User> {
        requireAuth(ctx, id);

        const existing = await this.findById(id);
        if (!existing) {
            businessError("User not found", "FF-007");
        }

        if (input.email && input.email !== existing.email) {
            await this.validateUniqueEmail(input.email);
        }

        const nextStatut = input.statut ?? existing.statut;
        const nextSociete = input.societe ?? existing.societe;
        const nextTypeActivite = input.typeActivite ?? existing.type_activite;
        const nextSiret = input.siret ?? existing.siret;
        const nextRc = input.rc ?? existing.rc;

        if (nextStatut === "professionnel") {
            if (!nextSociete || !nextTypeActivite || !nextSiret || !nextRc) {
                businessError(
                    "Professional users must provide: societe, typeActivite, siret, rc",
                    "FF-005"
                );
            }
        }

        const data: Record<string, unknown> = {};
        if (input.nom !== undefined) data.nom = input.nom;
        if (input.prenom !== undefined) data.prenom = input.prenom;
        if (input.dateNaissance !== undefined) data.date_naissance = input.dateNaissance;
        if (input.email !== undefined) data.email = input.email;
        if (input.telephone !== undefined) data.telephone = input.telephone;
        if (input.adresse !== undefined) data.adresse = input.adresse;
        if (input.codePostal !== undefined) data.code_postal = input.codePostal;
        if (input.ville !== undefined) data.ville = input.ville;
        if (input.langues !== undefined) data.langues = input.langues;
        if (input.photoUrl !== undefined) data.photo_url = input.photoUrl;
        if (input.statut !== undefined) data.statut = input.statut;
        if (input.societe !== undefined) data.societe = input.societe;
        if (input.typeActivite !== undefined) data.type_activite = input.typeActivite;
        if (input.siret !== undefined) data.siret = input.siret;
        if (input.rc !== undefined) data.rc = input.rc;
        if (input.permisBateau !== undefined) data.permis_bateau = input.permisBateau;
        if (input.assurance !== undefined) data.assurance = input.assurance;
        if (input.password !== undefined) data.password_hash = await this.hashPassword(input.password);

        return this.prisma.user.update({
            where: { id },
            data
        });
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * BR-U4: GDPR soft delete with anonymization
     */
    async delete(id: string): Promise<boolean> {
        const user = await this.findById(id);

        if (!user) {
            businessError("User not found", "FF-007");
        }

        await this.prisma.user.update({
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
    }

    /**
     * Check if user has valid boat license
     */
    async hasValidBoatLicense(userId: string): Promise<boolean> {
        const user = await this.findById(userId);
        if (!user) return false;

        return user.permis_bateau?.length === 8;
    }

    /**
     * Check if user owns any boats
     */
    async ownsBoats(userId: string): Promise<boolean> {
        const boatsCount = await this.prisma.boat.count({
            where: { user_id: userId, deleted_at: null }
        });

        return boatsCount > 0;
    }

    // PRIVATE VALIDATION METHODS

    private validateProfessionalUser(input: CreateUserInput): void {
        if (input.statut === 'professionnel') {
            if (!input.societe || !input.typeActivite || !input.siret || !input.rc) {
                businessError(
                    "Professional users must provide: societe, typeActivite, siret, rc",
                    "FF-005"
                );
            }
        }
    }

    private async validateUniqueEmail(email: string): Promise<void> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            businessError("A user with this email already exists", "FF-006");
        }
    }
}
