import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
const secret = new TextEncoder().encode(process.env.SECRET!);

export async function midlleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = path === "/" || path === "/auth/singup" || path === "/login";
  const token = req.cookies.get("token");
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isPublic) {
    return NextResponse.next();
  }
  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, secret);
      const tokenExpiration = new Date((payload.exp ?? 0) * 1000);
      if (tokenExpiration <= new Date()) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/singup", "/auth/login"],
};
