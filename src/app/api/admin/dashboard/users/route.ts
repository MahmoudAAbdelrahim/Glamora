import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import{ connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";

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

export async function GET(request: NextRequest) {
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

    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("limit") || "10", 10),
        1
      ),
      100
    );

    const query: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      query.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (role === "admin" || role === "user") {
      query.role = role;
    }

    if (status === "blocked") {
      query.isBlocked = true;
    }

    if (status === "active") {
      query.isBlocked = false;
    }

    const skip = (page - 1) * limit;

    const [users, total, totalUsers, totalAdmins, blockedUsers, activeUsers] =
      await Promise.all([
        User.find(query)
          .select(
            "_id fullName email phone role profileImage address isBlocked createdAt updatedAt"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        User.countDocuments(query),

        User.countDocuments({
          deletedAt: null,
        }),

        User.countDocuments({
          deletedAt: null,
          role: "admin",
        }),

        User.countDocuments({
          deletedAt: null,
          isBlocked: true,
        }),

        User.countDocuments({
          deletedAt: null,
          isBlocked: false,
        }),
      ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((user) => ({
          ...user,
          id: user._id.toString(),
          _id: undefined,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        stats: {
          total: totalUsers,
          admins: totalAdmins,
          users: totalUsers - totalAdmins,
          blocked: blockedUsers,
          active: activeUsers,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN_USERS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users",
      },
      { status: 500 }
    );
  }
}