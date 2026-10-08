import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

type AuthPayload = {
  userId?: string;
  role?: string;
};

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");

    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      ),
    };
  }

  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    const auth = payload as AuthPayload;

    if (!auth.userId || auth.role !== "admin") {
      return {
        ok: false as const,
        response: NextResponse.json(
          { success: false, message: "Admin access required" },
          { status: 403 }
        ),
      };
    }

    return {
      ok: true as const,
      userId: auth.userId,
    };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 }
      ),
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    await connectDB();

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      totalAdmins,
      blockedUsers,
    ] = await Promise.all([
      User.countDocuments({
        deletedAt: null,
      }),

      User.countDocuments({
        deletedAt: null,
        isBlocked: false,
      }),

      User.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startOfToday,
        },
      }),

      User.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startOfMonth,
        },
      }),

      User.countDocuments({
        deletedAt: null,
        role: "admin",
      }),

      User.countDocuments({
        deletedAt: null,
        isBlocked: true,
      }),
    ]);

    /*
     * Orders / Products
     *
     * هنقرأهم بشكل آمن لو الـ Models موجودة.
     * حاليًا الـ Dashboard يعتمد فعليًا على User Model،
     * ولما نعمل Product/Order models هنربطهم هنا.
     */

    const recentUsers = await User.find({
      deletedAt: null,
    })
      .select(
        "_id fullName email role profileImage createdAt isBlocked"
      )
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .lean();

    const usersByDay = await User.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: new Date(
              now.getTime() - 6 * 24 * 60 * 60 * 1000
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const previousMonthUsers = await User.countDocuments({
      deletedAt: null,
      createdAt: {
        $gte: startOfPreviousMonth,
        $lte: endOfPreviousMonth,
      },
    });

    const userGrowth =
      previousMonthUsers > 0
        ? ((newUsersThisMonth - previousMonthUsers) /
            previousMonthUsers) *
          100
        : newUsersThisMonth > 0
          ? 100
          : 0;

    return NextResponse.json({
      success: true,

      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          admins: totalAdmins,
          today: newUsersToday,
          thisMonth: newUsersThisMonth,
          previousMonth: previousMonthUsers,
          growth: Number(userGrowth.toFixed(1)),
        },

        products: {
          total: 0,
          active: 0,
          outOfStock: 0,
        },

        orders: {
          total: 0,
          completed: 0,
          processing: 0,
          pending: 0,
          cancelled: 0,
        },

        sales: {
          total: 0,
          today: 0,
          thisMonth: 0,
          growth: 0,
        },

        usersByDay,

        recentUsers: recentUsers.map((user) => ({
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          profileImage: user.profileImage?.url ?? null,
          createdAt: user.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}