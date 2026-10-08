import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const locales = ["ar", "en"] as const;

type Locale = (typeof locales)[number];

const guestOnlyRoutes = [
  "/login",
  "/register",
];

const protectedRoutes = [
  "/profile",
  "/orders",
  "/checkout",
  "/favorites",
];

const adminRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/dashboard/users",
  "/admin/dashboard/products",
  "/admin/dashboard/orders",
  "/admin/dashboard/profile",
];

function getLocale(pathname: string): Locale {
  const firstSegment = pathname.split("/")[1];

  return firstSegment === "en"
    ? "en"
    : "ar";
}

function removeLocale(pathname: string) {
  const segments = pathname.split("/");

  if (
    locales.includes(
      segments[1] as Locale
    )
  ) {
    const withoutLocale =
      `/${segments.slice(2).join("/")}`;

    return withoutLocale === "/"
      ? "/"
      : withoutLocale;
  }

  return pathname;
}

function matchesRoute(
  pathname: string,
  routes: string[]
) {
  return routes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  const secretKey =
    new TextEncoder().encode(secret);

  const { payload } = await jwtVerify(
    token,
    secretKey
  );

  return payload;
}

export async function proxy(
  request: NextRequest
) {
  const { pathname, search } =
    request.nextUrl;

  /*
   * Don't interfere with API routes.
   */
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const locale = getLocale(pathname);

  const routeWithoutLocale =
    removeLocale(pathname);

  const isGuestOnly =
    matchesRoute(
      routeWithoutLocale,
      guestOnlyRoutes
    );

  const isProtected =
    matchesRoute(
      routeWithoutLocale,
      protectedRoutes
    );

  const isAdminRoute =
    matchesRoute(
      routeWithoutLocale,
      adminRoutes
    );

  if (
    !isGuestOnly &&
    !isProtected &&
    !isAdminRoute
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(
      "accessToken"
    )?.value;

  let user = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch {
      user = null;
    }
  }

  /*
   * Logged-in user trying to access login/register.
   */
  if (isGuestOnly && user) {
    const redirect =
      request.nextUrl.searchParams.get(
        "redirect"
      );

    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
    ) {
      return NextResponse.redirect(
        new URL(
          redirect,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/${locale}/profile`,
        request.url
      )
    );
  }

  /*
   * Protected/admin page without authentication.
   */
  if (
    (isProtected || isAdminRoute) &&
    !user
  ) {
    const loginUrl = new URL(
      `/${locale}/login`,
      request.url
    );

    const returnUrl =
      `${pathname}${search}`;

    loginUrl.searchParams.set(
      "redirect",
      returnUrl
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  /*
   * Admin pages require admin role.
   */
  if (
    isAdminRoute &&
    user?.role !== "admin"
  ) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/profile`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};