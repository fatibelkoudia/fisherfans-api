import bcrypt from "bcrypt";
import { PrismaClient, User } from "@prisma/client";
import { BaseService } from "./base.service";
import { CreateUserInput } from "../types/inputs";
import { businessError } from "../utils/errors";
import { UserService } from "./user.service";
import { signJwt } from "../utils/jwt";

interface AuthResult {
    user: User;
    token: string;
}

export class AuthService extends BaseService {
    constructor(prisma: PrismaClient, private readonly userService: UserService) {
        super(prisma);
    }

    async signup(input: CreateUserInput): Promise<AuthResult> {
        const user = await this.userService.create(input);
        return this.buildAuthResult(user);
    }

    async login(email: string, password: string): Promise<AuthResult> {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            businessError("Invalid credentials", "FF-401");
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            businessError("Invalid credentials", "FF-401");
        }

        return this.buildAuthResult(user);
    }

    private buildAuthResult(user: User): AuthResult {
        return {
            user,
            token: signJwt(
                { email: user.email },
                { subject: user.id }
            )
        };
    }
}
