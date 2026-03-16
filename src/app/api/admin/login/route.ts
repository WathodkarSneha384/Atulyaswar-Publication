import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminKey } from "@/lib/adminAuth";

type LoginPayload = {
  key?: string;
};

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const key = (payload.key ?? "").trim();
  if (!isValidAdminKey(key)) {
    return NextResponse.json({ error: "Invalid admin key." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
