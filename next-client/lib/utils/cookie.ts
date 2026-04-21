export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date | number;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

function isBrowser() {
  return typeof document !== "undefined";
}

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  const parts = [`${encodedName}=${encodedValue}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.expires !== undefined) {
    const expires =
      options.expires instanceof Date
        ? options.expires
        : new Date(Date.now() + options.expires * 1000);

    parts.push(`Expires=${expires.toUTCString()}`);
  }

  parts.push(`Path=${options.path ?? "/"}`);

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(
      `SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`,
    );
  }

  return parts.join("; ");
}

export function parseCookies(cookieString = "") {
  return cookieString
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, entry) => {
      const separatorIndex = entry.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = decodeURIComponent(entry.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(entry.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

export function getCookie(name: string, cookieString?: string) {
  const source = cookieString ?? (isBrowser() ? document.cookie : "");
  const cookies = parseCookies(source);
  return cookies[name];
}

export function getAllCookies(cookieString?: string) {
  const source = cookieString ?? (isBrowser() ? document.cookie : "");
  return parseCookies(source);
}

export function hasCookie(name: string, cookieString?: string) {
  return getCookie(name, cookieString) !== undefined;
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  const serialized = serializeCookie(name, value, options);

  if (isBrowser()) {
    document.cookie = serialized;
  }

  return serialized;
}

export function removeCookie(name: string, options: CookieOptions = {}) {
  return setCookie(name, "", {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  });
}
