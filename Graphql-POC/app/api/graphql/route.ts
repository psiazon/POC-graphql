import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { prisma } from "@/lib/prisma";

function requireApiKey(req: Request) {
  const expected = process.env.GRAPHQL_API_KEY?.trim();
  if (!expected) return;

  const got = req.headers.get("x-api-key")?.trim();
  if (got !== expected) {
    const msg = "Unauthorized: missing/invalid x-api-key";
    return new Response(JSON.stringify({ errors: [{ message: msg }] }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Request, Response },
  context: async ({ request }) => {
    // Example: attach db + request metadata to resolvers (useful for auth/logging)
    return {
      prisma,
      requestId: request.headers.get("x-request-id") ?? null,
    };
  },
});

export async function GET(request: Request) {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;
  return yoga.handleRequest(request);
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;
  return yoga.handleRequest(request);
}
