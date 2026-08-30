import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();

  cookieStore.delete("jwt");

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}