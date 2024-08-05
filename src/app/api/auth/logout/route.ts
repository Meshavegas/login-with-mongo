import bcrypt from "bcrypt";

import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json(
    {
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  response.cookies.delete("token");
  return response;
}
