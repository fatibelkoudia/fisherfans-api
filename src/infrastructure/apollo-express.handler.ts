import { ApolloServer, HeaderMap } from "@apollo/server";
import { NextFunction, Request, Response } from "express";
import { parse as urlParse } from "url";
import { Context } from "../context";

type ContextFactory = (args: { req: Request; res: Response }) => Promise<Context> | Context;

export function createApolloExpressHandler(
    server: ApolloServer<Context>,
    createContext: ContextFactory
) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const headers = new HeaderMap();
            for (const [key, value] of Object.entries(req.headers)) {
                if (value !== undefined) {
                    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
                }
            }

            const httpGraphQLRequest = {
                method: req.method,
                headers,
                search: urlParse(req.url || "").search ?? "",
                body: req.body,
            };

            const contextValue = await createContext({ req, res });

            const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
                httpGraphQLRequest,
                context: async () => contextValue,
            });

            for (const [key, value] of httpGraphQLResponse.headers) {
                res.setHeader(key, value);
            }

            res.status(httpGraphQLResponse.status ?? 200);

            if (httpGraphQLResponse.body.kind === "complete") {
                res.send(httpGraphQLResponse.body.string);
                return;
            }

            for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
                res.write(chunk);
            }

            res.end();
        } catch (error) {
            next(error);
        }
    };
}
