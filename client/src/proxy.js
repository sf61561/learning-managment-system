import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import getUserData from "./lib/getUserData";

export default async function proxy(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;
    if (!token) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }
    const user = await getUserData(token);
    if (!user || !user.role?.name) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }
    const userRole = user.role.name.toLowerCase();
    const pathname = request.nextUrl.pathname;
    const requestedRole = pathname.split("/")[1]?.toLowerCase();
    if (requestedRole === userRole) {
        return NextResponse.next();
    }
    return NextResponse.redirect(
        new URL(`/${userRole}/dashboard`, request.url)
    );
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/instructor/:path*",
        "/student/:path*",
    ],
};