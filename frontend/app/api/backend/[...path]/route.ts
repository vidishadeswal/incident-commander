import { NextRequest } from "next/server";

const FALLBACK_BACKEND_BASES = [
  process.env.BACKEND_BASE_URL,
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  "http://localhost:8000",
  "http://host.docker.internal:8000",
].filter((value): value is string => Boolean(value));

function stripHopByHopHeaders(headers: Headers): Headers {
  const filtered = new Headers(headers);
  [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
  ].forEach((name) => filtered.delete(name));
  return filtered;
}

async function proxy(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const incomingHeaders = new Headers(request.headers);
  incomingHeaders.delete("host");

  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const requestPath = `/${pathSegments.join("/")}${request.nextUrl.search}`;

  let lastError = "No backend candidates were configured.";

  for (const baseUrl of FALLBACK_BACKEND_BASES) {
    const target = `${baseUrl.replace(/\/$/, "")}${requestPath}`;
    try {
      const response = await fetch(target, {
        method: request.method,
        headers: incomingHeaders,
        body: requestBody,
        redirect: "manual",
      });

      return new Response(response.body, {
        status: response.status,
        headers: stripHopByHopHeaders(response.headers),
      });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  return Response.json(
    {
      error: "Backend proxy failed",
      detail: lastError,
      candidates: FALLBACK_BACKEND_BASES,
    },
    { status: 502 },
  );
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxy(request, path);
}
