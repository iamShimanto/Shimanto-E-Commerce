import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/resend-otp",
  "/reset-password",
  "/verify-otp",
];

const PROTECTED_PREFIXES = ["/account", "/admin"];

type ProfileAuthResult = {
  authenticated: boolean;
  role?: string;
};

function getRoleFromResponse(body: unknown) {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const data = (body as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const role = (data as { role?: unknown }).role;
  return typeof role === "string" ? role : undefined;
}

function upsertCookie(
  cookieHeader: string,
  cookieName: string,
  cookieValue: string,
) {
  const segments = cookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => !segment.startsWith(`${cookieName}=`));

  segments.push(`${cookieName}=${cookieValue}`);
  return segments.join("; ");
}

async function getProfileAuth(cookieHeader: string): Promise<ProfileAuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    const body = (await response.json()) as unknown;
    return {
      authenticated: true,
      role: getRoleFromResponse(body),
    };
  } catch {
    return { authenticated: false };
  }
}

function getCookieValue(setCookieHeader: string | null, cookieName: string) {
  if (!setCookieHeader) {
    return null;
  }

  const cookiePair = setCookieHeader
    .split(";")[0]
    ?.trim()
    .match(new RegExp(`^${cookieName}=([^;]+)$`));

  return cookiePair?.[1] ?? null;
}

async function refreshAccessToken(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refreshtoken`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const setCookieHeader = response.headers.get("set-cookie");
    return getCookieValue(setCookieHeader, "jwt_access");
  } catch {
    return null;
  }
}

async function resolveAuth(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  if (!cookieHeader) {
    return {
      authenticated: false,
    };
  }

  const profileAuth = await getProfileAuth(cookieHeader);

  if (profileAuth.authenticated) {
    return {
      authenticated: true,
      role: profileAuth.role,
      refreshedAccessToken: null,
    };
  }

  const refreshedAccessToken = await refreshAccessToken(request);

  if (refreshedAccessToken) {
    const refreshedCookieHeader = upsertCookie(
      cookieHeader,
      "jwt_access",
      refreshedAccessToken,
    );
    const refreshedProfileAuth = await getProfileAuth(refreshedCookieHeader);

    if (refreshedProfileAuth.authenticated) {
      return {
        authenticated: true,
        role: refreshedProfileAuth.role,
        refreshedAccessToken,
      };
    }
  }

  return {
    authenticated: false,
  };
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getPostLoginPath(role?: string) {
  return role === "admin" || role === "staff" ? "/admin" : "/account/profile";
}

function redirectTo(request: NextRequest, destination: string) {
  return NextResponse.redirect(new URL(destination, request.url));
}

function attachAccessCookie(
  response: NextResponse,
  token: string | null | undefined,
) {
  if (!token) {
    return response;
  }

  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set("jwt_access", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const resolvedAuth = await resolveAuth(request);

  if (isAuthPage(pathname)) {
    if (resolvedAuth.authenticated) {
      return attachAccessCookie(
        NextResponse.redirect(
          new URL(getPostLoginPath(resolvedAuth.role), request.url),
        ),
        resolvedAuth.refreshedAccessToken,
      );
    }

    return attachAccessCookie(
      NextResponse.next(),
      resolvedAuth.refreshedAccessToken,
    );
  }

  if (pathname.startsWith("/admin")) {
    if (!resolvedAuth.authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return redirectTo(request, loginUrl.toString());
    }

    if (resolvedAuth.role !== "admin" && resolvedAuth.role !== "staff") {
      return attachAccessCookie(
        NextResponse.redirect(new URL("/account/profile", request.url)),
        resolvedAuth.refreshedAccessToken,
      );
    }

    return attachAccessCookie(
      NextResponse.next(),
      resolvedAuth.refreshedAccessToken,
    );
  }

  if (pathname.startsWith("/account")) {
    if (!resolvedAuth.authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return redirectTo(request, loginUrl.toString());
    }

    return attachAccessCookie(
      NextResponse.next(),
      resolvedAuth.refreshedAccessToken,
    );
  }

  if (isProtectedPath(pathname) && !resolvedAuth.authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return redirectTo(request, loginUrl.toString());
  }

  return attachAccessCookie(
    NextResponse.next(),
    resolvedAuth.refreshedAccessToken,
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
