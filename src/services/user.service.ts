import { User } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateUserInput } from "../types/inputs";
import { businessError } from "../utils/errors";

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
                assurance: input.assurance
            }
        });
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

        return !!(user.permis_bateau && user.permis_bateau.length === 8);
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