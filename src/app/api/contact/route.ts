import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import ContactMessage from "../../../models/ContactMessage";

export const runtime = "nodejs";

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, message: "يجب تسجيل الدخول أولًا" },
        { status: 401 }
      ),
    };
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return {
      error: NextResponse.json(
        { success: false, message: "خطأ في إعدادات السيرفر" },
        { status: 500 }
      ),
    };
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret)
    );

    if (!payload.userId) {
      return {
        error: NextResponse.json(
          { success: false, message: "جلسة غير صالحة" },
          { status: 401 }
        ),
      };
    }

    await connectDB();

    const user = await User.findById(String(payload.userId)).select(
      "_id fullName email phone role isBlocked deletedAt"
    );

    if (!user) {
      return {
        error: NextResponse.json(
          { success: false, message: "المستخدم غير موجود" },
          { status: 401 }
        ),
      };
    }

    if (user.isBlocked || user.deletedAt) {
      return {
        error: NextResponse.json(
          { success: false, message: "الحساب غير نشط" },
          { status: 403 }
        ),
      };
    }

    return { user };
  } catch {
    return {
      error: NextResponse.json(
        { success: false, message: "الجلسة منتهية، سجل دخولك مجددًا" },
        { status: 401 }
      ),
    };
  }
}

/* GET: بيانات المستخدم لملء الفورم */

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);

    if ("error" in auth) {
      return auth.error;
    }

    return NextResponse.json({
      success: true,
      data: {
        fullName: auth.user.fullName || "",
        email: auth.user.email || "",
        phone: auth.user.phone || "",
      },
    });
  } catch (error) {
    console.error("CONTACT_GET_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "تعذر تحميل بيانات المستخدم" },
      { status: 500 }
    );
  }
}

/* POST: حفظ الرسالة */

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);

    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();

    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (subject.length < 3 || subject.length > 120) {
      return NextResponse.json(
        {
          success: false,
          message: "الموضوع يجب أن يكون بين 3 و120 حرفًا",
        },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message: "الرسالة يجب أن تكون بين 10 و3000 حرف",
        },
        { status: 400 }
      );
    }

    const savedMessage = await ContactMessage.create({
      userId: auth.user._id,
      fullName: auth.user.fullName,
      email: auth.user.email,
      phone: auth.user.phone || "",
      subject,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إرسال رسالتك بنجاح",
        data: {
          id: String(savedMessage._id),
          status: savedMessage.status,
          createdAt: savedMessage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CONTACT_POST_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إرسال الرسالة" },
      { status: 500 }
    );
  }
}