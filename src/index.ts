import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { PrismaClient } from "@prisma/client";

async function start() {
    const prisma = new PrismaClient();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const { url } = await startStandaloneServer(server, {
        context: async () => ({ prisma }),
        listen: { port: 4000 },
    });

    console.log(` FisherFans API ready at ${url}`);
}

start();