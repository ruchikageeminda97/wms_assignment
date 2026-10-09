import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };
const sessionCookie = "gather_session";

async function proxy(request: Request, context: RouteContext) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
  }

  const { path } = await context.params;
  const target = `${apiBase.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`;
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(request.method === "GET" || request.method === "HEAD"
        ? {}
        : { body: await request.text() }),
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("Content-Type", upstreamType);
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    });
    if (upstream.status === 401) (await cookies()).delete(sessionCookie);
    return response;
  } catch {
    return NextResponse.json({ message: "The API server could not be reached." }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
