import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const sessionCookie = "gather_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${apiBase.replace(/\/$/, "")}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      cookieStore.delete(sessionCookie);
      return NextResponse.json(payload ?? { message: "Session expired." }, { status: upstream.status });
    }
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ message: "The API server could not be reached." }, { status: 502 });
  }
}
