import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";

import { connectDB }  from "../../../../../../lib/db";
import User from "../../../../../../models/User";

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
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (payload.role !== "admin" || !payload.userId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    const user = await User.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    /*
     * Prevent an admin from blocking or demoting himself.
     */
    if (user._id.toString() === String(admin.userId)) {
      if (
        typeof body.isBlocked === "boolean" &&
        body.isBlocked === true
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot block your own account",
          },
          { status: 400 }
        );
      }

      if (body.role && body.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot remove your own admin role",
          },
          { status: 400 }
        );
      }
    }

    if (typeof body.isBlocked === "boolean") {
      user.isBlocked = body.isBlocked;
    }

    if (body.role === "admin" || body.role === "user") {
      user.role = body.role;
    }

    if (typeof body.fullName === "string") {
      const fullName = body.fullName.trim();

      if (fullName.length < 2) {
        return NextResponse.json(
          {
            success: false,
            message: "Full name is too short",
          },
          { status: 400 }
        );
      }

      user.fullName = fullName;
    }

    if (typeof body.phone === "string") {
      user.phone = body.phone.trim();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isBlocked: user.isBlocked,
          profileImage: user.profileImage,
          address: user.address,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN_USER_PATCH_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    if (String(admin.userId) === id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    /*
     * Soft delete.
     * The account remains in MongoDB but disappears
     * from normal user queries.
     */
    user.deletedAt = new Date();
    user.isBlocked = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN_USER_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}