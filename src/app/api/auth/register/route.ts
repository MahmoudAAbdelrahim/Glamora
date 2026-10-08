import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { registerSchema } from "../../../../lib/validators/auth";
import cloudinary from "../../../../lib/cloudinary";
import { createAccessToken } from "../../../../lib/auth";

function getString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();

    const fullName = getString(formData, "fullName");
    const email = getString(formData, "email").toLowerCase();
    const phone = getString(formData, "phone");
    const password = getString(formData, "password");

    const address = {
      governorate: getString(formData, "governorate"),
      city: getString(formData, "city"),
      area: getString(formData, "area"),
      street: getString(formData, "street"),
      building: getString(formData, "building"),
      floor: getString(formData, "floor"),
      apartment: getString(formData, "apartment"),
      postalCode: getString(formData, "postalCode"),
      notes: getString(formData, "notes"),
    };

    const validation = registerSchema.safeParse({
      fullName,
      email,
      phone,
      password,
      address,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "بيانات التسجيل غير صحيحة.",
        },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({
      email,
    }).select("_id");

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني مستخدم بالفعل.",
        },
        { status: 409 }
      );
    }

    const existingPhone = await User.findOne({
      phone,
    }).select("_id");

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف مستخدم بالفعل.",
        },
        { status: 409 }
      );
    }

    let profileImage = {
      url: "",
      publicId: "",
    };
    const image = formData.get("profileImage");

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: "ملف البروفايل يجب أن يكون صورة.",
          },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message: "حجم صورة البروفايل يجب ألا يتجاوز 5MB.",
          },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "glamora/users/profiles",
            resource_type: "image",
            transformation: [
              {
                width: 500,
                height: 500,
                crop: "fill",
                gravity: "face",
              },
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(
                error ||
                  new Error("Cloudinary upload failed")
              );

              return;
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        stream.end(buffer);
      });

      profileImage = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,

      role: "user",

      profileImage,

      address,

      isBlocked: false,
      deletedAt: null,
    });

    const token = await createAccessToken({
      userId: String(user._id),
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح.",
        user: {
          id: String(user._id),
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          address: user.address,
        },
      },
      { status: 201 }
    );

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
  } catch (error: unknown) {
    console.error("REGISTER ERROR:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء إنشاء الحساب.",
      },
      { status: 500 }
    );
  }
}