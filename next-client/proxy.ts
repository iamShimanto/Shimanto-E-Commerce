import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

type AuthPayload = JWTPayload & {
  _id?: string;
  role?: string;
  email?: string;
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_KEY = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;
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

async function verifyToken(token: string | undefined) {
  if (!token || !JWT_KEY) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<AuthPayload>(token, JWT_KEY, {
      algorithms: ["HS256"],
    });

    return {
      role: typeof payload.role === "string" ? payload.role : undefined,
    };
  } catch {
    return null;
  }
}

function getRole(payload: AuthPayload | null) {
  return typeof payload?.role === "string" ? payload.role : undefined;
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
  const accessToken = request.cookies.get("jwt_access")?.value;
  const accessAuth = await verifyToken(accessToken);

  if (accessAuth) {
    return {
      authenticated: true,
      role: getRole(accessAuth),
      refreshedAccessToken: null,
    };
  }

  const refreshToken = request.cookies.get("jwt_refresh")?.value;
  const refreshAuth = await verifyToken(refreshToken);

  if (refreshAuth) {
    const refreshedAccessToken = await refreshAccessToken(request);

    if (refreshedAccessToken) {
      return {
        authenticated: true,
        role: getRole(refreshAuth),
        refreshedAccessToken,
      };
    }

    return {
      authenticated: false,
    };
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

function redirectWithCleanup(request: NextRequest, destination: string) {
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.delete("jwt_access");
  response.cookies.delete("jwt_refresh");
  return response;
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
      return redirectWithCleanup(request, loginUrl.toString());
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
      return redirectWithCleanup(request, loginUrl.toString());
    }

    return attachAccessCookie(
      NextResponse.next(),
      resolvedAuth.refreshedAccessToken,
    );
  }

  if (isProtectedPath(pathname) && !resolvedAuth.authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return redirectWithCleanup(request, loginUrl.toString());
  }

  return attachAccessCookie(
    NextResponse.next(),
    resolvedAuth.refreshedAccessToken,
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
