import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB }from "@/src/lib/db";
import User from "../../../../../models/User";
import Order from "../../../../../models/Order";

const JWT_SECRET = process.env.JWT_SECRET;

function getSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(JWT_SECRET);
}

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized",
    };
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    const userId = String(payload.userId || "");
    const role = String(payload.role || "");

    if (!userId) {
      return {
        ok: false,
        status: 401,
        message: "Invalid authentication",
      };
    }

    if (role !== "admin") {
      return {
        ok: false,
        status: 403,
        message: "Admin access required",
      };
    }

    await connectDB();

    const admin = await User.findById(userId).select(
      "_id role isBlocked deletedAt"
    );

    if (!admin) {
      return {
        ok: false,
        status: 401,
        message: "User not found",
      };
    }

    if (admin.role !== "admin") {
      return {
        ok: false,
        status: 403,
        message: "Admin access required",
      };
    }

    if (admin.isBlocked || admin.deletedAt) {
      return {
        ok: false,
        status: 403,
        message: "Admin account is not active",
      };
    }

    return {
      ok: true,
      userId,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Invalid or expired token",
    };
  }
}

function serializeOrder(order: any) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,

    user:
      order.userId && typeof order.userId === "object"
        ? {
            id: String(order.userId._id),
            fullName: order.userId.fullName || "",
            email: order.userId.email || "",
            phone: order.userId.phone || "",
          }
        : null,

    items: (order.items || []).map((item: any) => ({
      productId: String(item.productId),
      name: item.name,
      brand: item.brand || "",
      image: item.image || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),

    shippingAddress: order.shippingAddress,

    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,

    paymentMethod: order.paymentMethod,
    status: order.status,

    statusHistory: (order.statusHistory || []).map((entry: any) => ({
      status: entry.status,
      note: entry.note || "",
      createdAt: entry.createdAt,
    })),

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    await connectDB();

    const query: Record<string, any> = {};

    if (
      status &&
      [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].includes(status)
    ) {
      query.status = status;
    }

    let orders = await Order.find(query)
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const normalizedSearch = search.toLowerCase();

      orders = orders.filter((order: any) => {
        const orderNumber = String(order.orderNumber || "").toLowerCase();

        const fullName = String(
          order.userId?.fullName || order.shippingAddress?.fullName || ""
        ).toLowerCase();

        const email = String(order.userId?.email || "").toLowerCase();

        const phone = String(
          order.userId?.phone || order.shippingAddress?.phone || ""
        ).toLowerCase();

        return (
          orderNumber.includes(normalizedSearch) ||
          fullName.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          phone.includes(normalizedSearch)
        );
      });
    }

    const serialized = orders.map(serializeOrder);

    const stats = {
      total: serialized.length,
      pending: serialized.filter((order) => order.status === "pending").length,
      confirmed: serialized.filter(
        (order) => order.status === "confirmed"
      ).length,
      processing: serialized.filter(
        (order) => order.status === "processing"
      ).length,
      shipped: serialized.filter((order) => order.status === "shipped").length,
      delivered: serialized.filter(
        (order) => order.status === "delivered"
      ).length,
      cancelled: serialized.filter(
        (order) => order.status === "cancelled"
      ).length,

      revenue: serialized
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        orders: serialized,
        stats,
      },
    });
  } catch (error) {
    console.error("ADMIN ORDERS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin orders",
      },
      { status: 500 }
    );
  }
}