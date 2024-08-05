import bcrypt from "bcrypt";
import User from "@/models/User";
import dbConnect from "@/utils/mongodb";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.SECRET;

async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password } = await req.json();
  try {
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email or password missing" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const jwtSecret = new TextEncoder().encode(secret);

    const token = await new SignJWT({ email, userId: user._id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1j")
      .sign(jwtSecret);

    const response = NextResponse.json(
      {
        message: "Login successful",
      },
      { status: 200 }
    );
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      secure: false,
    });

    return response;
  } catch (e) {
    return NextResponse.json(
      {
        message: "Login failed",
      },
      { status: 400 }
    );
  }
}
//require('crypto').randomBytes(100).toString('hex')
