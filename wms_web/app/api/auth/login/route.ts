import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { LoginResponse } from "@/lib/types";

const sessionCookie = "gather_session";

export async function POST(request: Request) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON request is required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase.replace(/\/$/, "")}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "The API server could not be reached." }, { status: 502 });
  }

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(payload ?? { message: "Login failed." }, { status: upstream.status });
  }

  const result = payload as LoginResponse;
  if (!result?.accessToken || !result.user) {
    return NextResponse.json({ message: "The API returned an invalid login response." }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json(result.user);
}
