import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";


import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { loginSchema } from "../../../../lib/validators/auth";
import { createAccessToken } from "../../../../lib/auth";



export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "بيانات تسجيل الدخول غير صحيحة.",
        },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase();
    const password = validation.data.password;

    const user = await User.findOne({
      email,
      deletedAt: null,
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "هذا الحساب محظور ولا يمكنه تسجيل الدخول.",
        },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        },
        { status: 401 }
      );
    }

    const token = await createAccessToken({
      userId: String(user._id),
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح.",
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
      },
    });

    response.cookies.set({
      name: "accessToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تسجيل الدخول.",
      },
      { status: 500 }
    );
  }
}