import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

type AuthPayload = JWTPayload & {
  role?: string;
  email?: string;
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_KEY = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
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

async function resolveAuth(request: NextRequest) {
  const accessToken = request.cookies.get("jwt_access")?.value;
  const accessAuth = await verifyToken(accessToken);

  if (accessAuth) {
    return {
      authenticated: true,
      role: accessAuth.role,
    };
  }

  const refreshToken = request.cookies.get("jwt_refresh")?.value;
  const refreshAuth = await verifyToken(refreshToken);

  if (refreshAuth) {
    return {
      authenticated: true,
      role: refreshAuth.role,
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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const resolvedAuth = await resolveAuth(request);

  if (isAuthPage(pathname)) {
    if (resolvedAuth.authenticated) {
      return NextResponse.redirect(
        new URL(getPostLoginPath(resolvedAuth.role), request.url),
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!resolvedAuth.authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return redirectWithCleanup(request, loginUrl.toString());
    }

    if (resolvedAuth.role !== "admin" && resolvedAuth.role !== "staff") {
      return NextResponse.redirect(new URL("/account/profile", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    if (!resolvedAuth.authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return redirectWithCleanup(request, loginUrl.toString());
    }

    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !resolvedAuth.authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return redirectWithCleanup(request, loginUrl.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
