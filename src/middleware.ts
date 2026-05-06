import { NextResponse, NextRequest } from "next/server";
import { getCookie } from "./utils/getCookieServer";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  const cookie = await getCookie();
  if (!cookie.token)
    return NextResponse.redirect(new URL("/auth/login", request.url));
  if (!cookie.user)
    return NextResponse.redirect(new URL("/auth/logout", request.url));

  const response = NextResponse.next();
  
  // Add caching headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}

export const config = {
  matcher: "/app/(.*)",
};
