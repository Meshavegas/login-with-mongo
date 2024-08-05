import bcrypt from "bcrypt";
import User from "@/models/User";
import dbConnect from "@/utils/mongodb";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { log } from "console";

const secret = process.env.SECRET;

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password, name, lastname } = await req.json();
  try {
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "LEs champs necessaires sont manquants" },
        { status: 400 }
      );
    }
    console.log("🧺 received data", email, password, name, lastname);

    console.log("🧺. email received", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      console.log("🧺. email not valid");
      return NextResponse.json(
        {
          error: "Le mail n'est pas valide",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (user) {
      console.log("🧺. user already exist");
      return NextResponse.json(
        { error: "Le mail existe déjà" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      lastname,
    });
    await newUser.save();
    console.log("🧺. user created");
    const jwtSecret = new TextEncoder().encode(secret);
    try {
      const token = await new SignJWT({ email, userId: newUser._id })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("300h")
        .sign(jwtSecret);
      console.log("🧺. token created");
      const response = NextResponse.json(
        {
          message: "Sign up successful",
          token,
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
      console.log("🧺. user already exist", e);

      return NextResponse.json(
        {
          error: "Le mail existe déjà",
        },
        { status: 400 }
      );
    }
  } catch (e) {
    console.error(e, "failed to create user");
    return NextResponse.json(
      {
        message: "Sign up failed",
      },
      { status: 400 }
    );
  }
}
//require('crypto').randomBytes(100).toString('hex')
