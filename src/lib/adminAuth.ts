export const ADMIN_COOKIE_NAME = "atulyaswar_admin_key";

export function isValidAdminKey(value: string) {
  const expected = process.env.MANUSCRIPT_ADMIN_KEY ?? "";
  return expected.length > 0 && value === expected;
}

export function getCookieValueFromHeader(cookieHeader: string, name: string) {
  const encodedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(new RegExp(`(?:^|; )${encodedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const keyFromCookie = getCookieValueFromHeader(cookieHeader, ADMIN_COOKIE_NAME);
  const keyFromHeader = request.headers.get("x-admin-key") ?? "";
  const candidate = keyFromCookie || keyFromHeader;
  return isValidAdminKey(candidate);
}
