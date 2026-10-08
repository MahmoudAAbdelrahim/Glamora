import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import bcrypt from "bcryptjs";

import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import cloudinary from "../../../lib/cloudinary";

function getString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

async function getAuthenticatedUserId(
  request: NextRequest
) {
  const token =
    request.cookies.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const secretKey = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(
      token,
      secretKey
    );

    if (
      typeof payload.userId !== "string"
    ) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/profile
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest
) {
  try {
    const userId =
      await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
    }).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير موجود.",
        },
        { status: 404 }
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
        profileImage: user.profileImage,
        address: user.address,
      },
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل بيانات الحساب.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/profile
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: NextRequest
) {
  let uploadedPublicId = "";

  try {
    const userId =
      await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
    }).select("+password");

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
            "هذا الحساب محظور حاليًا.",
        },
        { status: 403 }
      );
    }

    const formData =
      await request.formData();

    const fullName = getString(
      formData,
      "fullName"
    );

    const phone = getString(
      formData,
      "phone"
    );

    const governorate = getString(
      formData,
      "governorate"
    );

    const city = getString(
      formData,
      "city"
    );

    const area = getString(
      formData,
      "area"
    );

    const street = getString(
      formData,
      "street"
    );

    const building = getString(
      formData,
      "building"
    );

    const floor = getString(
      formData,
      "floor"
    );

    const apartment = getString(
      formData,
      "apartment"
    );

    const postalCode = getString(
      formData,
      "postalCode"
    );

    const notes = getString(
      formData,
      "notes"
    );

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "الاسم مطلوب.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف مطلوب.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check phone uniqueness
    |--------------------------------------------------------------------------
    */

    const phoneOwner =
      await User.findOne({
        phone,
        _id: {
          $ne: user._id,
        },
        deletedAt: null,
      }).select("_id");

    if (phoneOwner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "رقم الهاتف مستخدم بالفعل.",
        },
        { status: 409 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update basic information
    |--------------------------------------------------------------------------
    */

    user.fullName = fullName;
    user.phone = phone;

    user.address = {
      governorate,
      city,
      area,
      street,
      building,
      floor,
      apartment,
      postalCode,
      notes,
    };

    /*
    |--------------------------------------------------------------------------
    | Profile image
    |--------------------------------------------------------------------------
    */

    const removeProfileImage =
      getString(
        formData,
        "removeProfileImage"
      ) === "true";

    const image =
      formData.get("profileImage");

    if (
      image instanceof File &&
      image.size > 0
    ) {
      if (
        !image.type.startsWith("image/")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "ملف البروفايل يجب أن يكون صورة.",
          },
          { status: 400 }
        );
      }

      if (
        image.size >
        5 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "حجم صورة البروفايل يجب ألا يتجاوز 5MB.",
          },
          { status: 400 }
        );
      }

      const bytes =
        await image.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const uploaded =
        await new Promise<{
          secure_url: string;
          public_id: string;
        }>(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "glamora/users/profiles",
                  resource_type:
                    "image",

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
                (
                  error,
                  result
                ) => {
                  if (
                    error ||
                    !result
                  ) {
                    reject(
                      error ||
                        new Error(
                          "Cloudinary upload failed"
                        )
                    );

                    return;
                  }

                  resolve({
                    secure_url:
                      result.secure_url,
                    public_id:
                      result.public_id,
                  });
                }
              );

            stream.end(buffer);
          }
        );

      uploadedPublicId =
        uploaded.public_id;

      const oldPublicId =
        user.profileImage
          ?.publicId;

      user.profileImage = {
        url: uploaded.secure_url,
        publicId:
          uploaded.public_id,
      };

      await user.save();

      /*
      |--------------------------------------------------------------------------
      | Delete old Cloudinary image
      |--------------------------------------------------------------------------
      */

      if (
        oldPublicId &&
        oldPublicId !==
          uploaded.public_id
      ) {
        try {
          await cloudinary.uploader.destroy(
            oldPublicId,
            {
              resource_type: "image",
            }
          );
        } catch (deleteError) {
          console.error(
            "OLD PROFILE IMAGE DELETE ERROR:",
            deleteError
          );
        }
      }
    } else if (
      removeProfileImage
    ) {
      const oldPublicId =
        user.profileImage
          ?.publicId;

      user.profileImage = {
        url: "",
        publicId: "",
      };

      await user.save();

      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(
            oldPublicId,
            {
              resource_type: "image",
            }
          );
        } catch (deleteError) {
          console.error(
            "PROFILE IMAGE DELETE ERROR:",
            deleteError
          );
        }
      }
    } else {
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "تم تحديث بيانات الحساب بنجاح.",
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
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Cleanup uploaded image if DB update failed
    |--------------------------------------------------------------------------
    */

    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(
          uploadedPublicId,
          {
            resource_type: "image",
          }
        );
      } catch (cleanupError) {
        console.error(
          "CLOUDINARY CLEANUP ERROR:",
          cleanupError
        );
      }
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number })
        .code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "بعض البيانات مستخدمة بالفعل.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحديث الحساب.",
      },
      { status: 500 }
    );
  }
}