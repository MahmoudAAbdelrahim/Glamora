import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(
  request: NextRequest
) {
  try {
    const token =
      request.cookies.get("accessToken")
        ?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مسجل الدخول.",
        },
        { status: 401 }
      );
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not configured"
      );
    }

    const secretKey =
      new TextEncoder().encode(secret);

    const { payload } =
      await jwtVerify(
        token,
        secretKey
      );

    if (
      typeof payload.userId !==
      "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "جلسة غير صالحة.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user =
      await User.findOne({
        _id: payload.userId,
        deletedAt: null,
      }).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير موجود.",
        },
        { status: 404 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "هذا الحساب محظور.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,

      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        profileImage:
          user.profileImage,

        address: user.address,
      },
    });
  } catch (error) {
    console.error(
      "AUTH ME ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "جلسة الدخول غير صالحة.",
      },
      { status: 401 }
    );
  }
}