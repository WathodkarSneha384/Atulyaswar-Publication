const DEFAULT_FROM = "Atulyaswar Contact <onboarding@resend.dev>";
const DISALLOWED_DOMAIN = "send.atulyaswar.com";

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function domainFromEmail(value: string) {
  const at = value.lastIndexOf("@");
  if (at < 0) return "";
  return value.slice(at + 1).toLowerCase();
}

export function resolveFromEmail(rawValue?: string, fallbackRawValue?: string) {
  const fallbackRaw = compact(fallbackRawValue ?? "");
  const raw = compact(rawValue ?? "");
  if (!raw) return DEFAULT_FROM;

  const bracketMatch = raw.match(/^(.*?)<([^>]+)>$/);
  if (bracketMatch) {
    const display = compact(bracketMatch[1]).replace(/^"|"$/g, "");
    const address = compact(bracketMatch[2]);
    if (!isValidEmail(address)) return DEFAULT_FROM;
    if (domainFromEmail(address) === DISALLOWED_DOMAIN) {
      if (fallbackRaw && fallbackRaw !== raw) {
        return resolveFromEmail(fallbackRaw);
      }
      return DEFAULT_FROM;
    }
    return display ? `${display} <${address}>` : address;
  }

  if (isValidEmail(raw)) {
    if (domainFromEmail(raw) === DISALLOWED_DOMAIN) {
      if (fallbackRaw && fallbackRaw !== raw) {
        return resolveFromEmail(fallbackRaw);
      }
      return DEFAULT_FROM;
    }
    return `Atulyaswar Contact <${raw}>`;
  }

  return DEFAULT_FROM;
}

