import type { Handler } from "@netlify/functions";
import { createServer } from "http";
import { createRequestHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

// Create the handler for tRPC
const handler: Handler = async (event, context) => {
  // Extract the path after /api/trpc/
  const url = new URL(event.rawUrl || `https://${event.headers.host}${event.path}`);
  const pathname = url.pathname.replace("/.netlify/functions/trpc", "");
  
  // Create a mock request object
  const mockReq = {
    method: event.httpMethod,
    url: `http://localhost${pathname}${url.search}`,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : undefined,
  } as any;

  // Create a mock response object
  let statusCode = 200;
  let responseBody = "";
  const mockRes = {
    statusCode: 200,
    setHeader: (key: string, value: string) => {},
    end: (body: string) => {
      responseBody = body;
    },
    write: (body: string) => {
      responseBody += body;
    },
  } as any;

  // Use tRPC's standalone adapter
  const requestHandler = createRequestHandler({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC error on path ${path}:`, error);
    },
  });

  try {
    await requestHandler(mockReq, mockRes);
  } catch (error) {
    console.error("Error in tRPC handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }

  return {
    statusCode: mockRes.statusCode || 200,
    body: responseBody,
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export { handler };
