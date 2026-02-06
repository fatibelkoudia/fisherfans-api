import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { PrismaClient } from "@prisma/client";
import { ServiceContainer } from "./services";
import { jwtAuthMiddleware, AuthenticatedRequest } from "./infrastructure/auth.middleware";
import { createApolloExpressHandler } from "./infrastructure/apollo-express.handler";
import { Context } from "./context";

dotenv.config();

async function start() {
    const prisma = new PrismaClient();
    const services = new ServiceContainer(prisma);

    const server = new ApolloServer<Context>({
        typeDefs,
        resolvers,
    });

    await server.start();

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(jwtAuthMiddleware);

    const handler = createApolloExpressHandler(server, async ({ req }) => ({
        prisma,
        services,
        user: (req as AuthenticatedRequest).user,
    }));

    app.use("/graphql", handler);

    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () => {
        console.log(`FisherFans API ready at http://localhost:${port}/graphql`);
    });
}

start().catch((error) => {
    console.error("Failed to start FisherFans API", error);
    process.exit(1);
});
