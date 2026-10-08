import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Product from "../../../../models/Product";
import Order from "../../../../models/Order";

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
        {
          success: false,
          message: "Unauthorized",
        },
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
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      ),
    };
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const auth = payload as AuthPayload;

    if (!auth.userId || auth.role !== "admin") {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            success: false,
            message: "Admin access required",
          },
          { status: 403 }
        ),
      };
    }

    await connectDB();

    const admin = await User.findById(auth.userId).select(
      "_id role isBlocked deletedAt"
    );

    if (!admin) {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            success: false,
            message: "Admin user not found",
          },
          { status: 401 }
        ),
      };
    }

    if (admin.role !== "admin") {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            success: false,
            message: "Admin access required",
          },
          { status: 403 }
        ),
      };
    }

    if (admin.isBlocked || admin.deletedAt) {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            success: false,
            message: "Admin account is not active",
          },
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
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 }
      ),
    };
  }
}

function calculateGrowth(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(1)
  );
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    await connectDB();

    const now = new Date();

    /* =========================================================
       DATE RANGES
    ========================================================= */

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    /* =========================================================
       USERS
    ========================================================= */

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalAdmins,
      usersToday,
      usersThisMonth,
      usersPreviousMonth,
      recentUsers,
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
        isBlocked: true,
      }),

      User.countDocuments({
        deletedAt: null,
        role: "admin",
      }),

      User.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      User.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      }),

      User.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startOfPreviousMonth,
          $lt: startOfMonth,
        },
      }),

      User.find({
        deletedAt: null,
      })
        .select(
          "_id fullName email role profileImage isBlocked createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(6)
        .lean(),
    ]);

    /* =========================================================
       PRODUCTS
    ========================================================= */

    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments({
        deletedAt: null,
      }),

      Product.countDocuments({
        deletedAt: null,
        isActive: true,
      }),

      Product.countDocuments({
        deletedAt: null,
        isActive: false,
      }),

      Product.countDocuments({
        deletedAt: null,
        stock: {
          $lte: 0,
        },
      }),

      Product.countDocuments({
        deletedAt: null,
        stock: {
          $gt: 0,
        },
        $expr: {
          $lte: ["$stock", "$lowStockThreshold"],
        },
      }),
    ]);

    /* =========================================================
       ORDERS
    ========================================================= */

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      monthOrders,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        status: "pending",
      }),

      Order.countDocuments({
        status: "confirmed",
      }),

      Order.countDocuments({
        status: "processing",
      }),

      Order.countDocuments({
        status: "shipped",
      }),

      Order.countDocuments({
        status: "delivered",
      }),

      Order.countDocuments({
        status: "cancelled",
      }),

      Order.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      Order.countDocuments({
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      }),
    ]);

    /* =========================================================
       SALES
       cancelled orders are NOT counted as sales
    ========================================================= */

    const [
      totalSalesResult,
      todaySalesResult,
      monthSalesResult,
      previousMonthSalesResult,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
            createdAt: {
              $gte: startOfToday,
              $lt: startOfTomorrow,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
            createdAt: {
              $gte: startOfMonth,
              $lt: startOfNextMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
            createdAt: {
              $gte: startOfPreviousMonth,
              $lt: startOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$total",
            },
          },
        },
      ]),
    ]);

    const totalSales = Number(
      totalSalesResult[0]?.total || 0
    );

    const todaySales = Number(
      todaySalesResult[0]?.total || 0
    );

    const thisMonthSales = Number(
      monthSalesResult[0]?.total || 0
    );

    const previousMonthSales = Number(
      previousMonthSalesResult[0]?.total || 0
    );

    const salesGrowth = calculateGrowth(
      thisMonthSales,
      previousMonthSales
    );

    /* =========================================================
       SALES BY DAY - CURRENT MONTH
    ========================================================= */

    const salesByDayRaw = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
          createdAt: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
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
          sales: {
            $sum: "$total",
          },
          orders: {
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

    /* =========================================================
       TOP PRODUCTS
    ========================================================= */

    const topProducts = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",

          name: {
            $first: "$items.name",
          },

          image: {
            $first: "$items.image",
          },

          quantity: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: "$items.lineTotal",
          },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    /* =========================================================
       RECENT ORDERS
    ========================================================= */

    const recentOrders = await Order.find()
      .populate(
        "userId",
        "fullName email phone"
      )
      .sort({
        createdAt: -1,
      })
      .limit(8)
      .lean();

    /* =========================================================
       RESPONSE
    ========================================================= */

    return NextResponse.json({
      success: true,

      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          admins: totalAdmins,
          today: usersToday,
          thisMonth: usersThisMonth,
          previousMonth: usersPreviousMonth,
          growth: calculateGrowth(
            usersThisMonth,
            usersPreviousMonth
          ),
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          outOfStock: outOfStockProducts,
          lowStock: lowStockProducts,
        },

        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          completed: deliveredOrders,
          cancelled: cancelledOrders,
          today: todayOrders,
          thisMonth: monthOrders,
        },

        sales: {
          total: totalSales,
          today: todaySales,
          thisMonth: thisMonthSales,
          previousMonth: previousMonthSales,
          growth: salesGrowth,
        },

        salesByDay: salesByDayRaw.map(
          (item: any) => ({
            _id: item._id,
            sales: Number(item.sales || 0),
            orders: Number(item.orders || 0),
          })
        ),

        topProducts: topProducts.map(
          (item: any) => ({
            id: item._id
              ? String(item._id)
              : null,

            name: item.name || "",

            image: item.image || null,

            quantity: Number(
              item.quantity || 0
            ),

            revenue: Number(
              item.revenue || 0
            ),
          })
        ),

        recentUsers: recentUsers.map(
          (user: any) => ({
            id: String(user._id),
            fullName: user.fullName || "",
            email: user.email || "",
            role: user.role || "user",
            isBlocked: Boolean(
              user.isBlocked
            ),
            profileImage:
              user.profileImage?.url ||
              null,
            createdAt:
              user.createdAt,
          })
        ),

        recentOrders: recentOrders.map(
          (order: any) => ({
            id: String(order._id),

            orderNumber:
              order.orderNumber || "",

            customer:
              order.userId &&
              typeof order.userId === "object"
                ? {
                    id: String(
                      order.userId._id
                    ),
                    fullName:
                      order.userId
                        .fullName || "",
                    email:
                      order.userId.email ||
                      "",
                  }
                : {
                    id: null,
                    fullName:
                      order.shippingAddress
                        ?.fullName || "",
                    email: "",
                  },

            total: Number(
              order.total || 0
            ),

            status:
              order.status || "pending",

            itemsCount: Array.isArray(
              order.items
            )
              ? order.items.reduce(
                  (
                    sum: number,
                    item: any
                  ) =>
                    sum +
                    Number(
                      item.quantity || 0
                    ),
                  0
                )
              : 0,

            createdAt:
              order.createdAt,
          })
        ),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}