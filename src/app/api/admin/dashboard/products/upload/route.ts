import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { v2 as cloudinary } from "cloudinary";

import {connectDB} from "../../../../../../lib/db";

import User from "../../../../../../models/User";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(
      token,
      secretKey
    );

    if (!payload.userId) {
      return null;
    }

    if (payload.role !== "admin") {
      return null;
    }

    await connectDB();

    const user = await User.findById(payload.userId)
      .select("_id role isBlocked deletedAt")
      .lean();

    if (!user) {
      return null;
    }

    if (user.role !== "admin") {
      return null;
    }

    if (user.isBlocked || user.deletedAt) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Maximum image size: 5MB
     */
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be less than 5MB",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate image type
     */
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, JPEG, PNG and WEBP images are allowed",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Convert File → Buffer
     */
    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    /*
     * Upload to Cloudinary
     */
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder: "glamora/products",

            resource_type: "image",

            transformation: [
              {
                width: 1200,
                height: 1200,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }

            if (!uploadResult) {
              reject(
                new Error(
                  "Cloudinary upload failed"
                )
              );
              return;
            }

            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          }
        );

      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PRODUCT IMAGE UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload product image",
      },
      {
        status: 500,
      }
    );
  }
}