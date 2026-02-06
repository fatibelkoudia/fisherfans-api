import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "FisherFansDevSecret";

export function signJwt(payload: Record<string, unknown>, options?: SignOptions): string {
    const jwtOptions: SignOptions = {
        expiresIn: options?.expiresIn ?? "7d",
        ...options,
    };

    return jwt.sign(payload, JWT_SECRET, jwtOptions);
}

export function verifyJwt(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
