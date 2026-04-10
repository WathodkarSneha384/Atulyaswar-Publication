const DEFAULT_FROM = "Atulyaswar Contact <onboarding@resend.dev>";

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function resolveFromEmail(rawValue?: string) {
  const raw = compact(rawValue ?? "");
  if (!raw) return DEFAULT_FROM;

  const bracketMatch = raw.match(/^(.*?)<([^>]+)>$/);
  if (bracketMatch) {
    const display = compact(bracketMatch[1]).replace(/^"|"$/g, "");
    const address = compact(bracketMatch[2]);
    if (!isValidEmail(address)) return DEFAULT_FROM;
    return display ? `${display} <${address}>` : address;
  }

  if (isValidEmail(raw)) {
    return `Atulyaswar Contact <${raw}>`;
  }

  return DEFAULT_FROM;
}

