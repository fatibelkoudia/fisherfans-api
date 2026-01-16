import { GraphQLError } from "graphql";

export class BusinessError extends Error {
    public readonly code: string;

    constructor(message: string, code: string) {
        super(message);
        this.name = "BusinessError";
        this.code = code;
    }

    toGraphQLError(): GraphQLError {
        return new GraphQLError(this.message, {
            extensions: { code: this.code }
        });
    }
}

export function businessError(message: string, code: string): never {
    throw new BusinessError(message, code);
}