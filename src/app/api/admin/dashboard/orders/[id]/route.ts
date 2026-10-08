import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB }from "@/src/lib/db";
import User from "../../../../../../models/User";
import Order from "../../../../../../models/Order";


const JWT_SECRET = process.env.JWT_SECRET;

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

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

    if (
      admin.role !== "admin" ||
      admin.isBlocked ||
      admin.deletedAt
    ) {
      return {
        ok: false,
        status: 403,
        message: "Admin access required",
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

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function canChangeStatus(
  current: OrderStatus,
  next: OrderStatus
) {
  if (current === next) return true;

  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  return transitions[current]?.includes(next) ?? false;
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order id",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id)
      .populate("userId", "fullName email phone")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: serializeOrder(order),
      },
    });
  } catch (error) {
    console.error("ADMIN ORDER GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load order",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order id",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const nextStatus = String(body.status || "") as OrderStatus;
    const note = String(body.note || "").trim();

    if (!VALID_STATUSES.includes(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const currentStatus = order.status as OrderStatus;

    if (!canChangeStatus(currentStatus, nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot change order status from ${currentStatus} to ${nextStatus}`,
        },
        { status: 400 }
      );
    }

    if (currentStatus !== nextStatus) {
      order.status = nextStatus;

      order.statusHistory.push({
        status: nextStatus,
        note,
        createdAt: new Date(),
      });
    } else if (note) {
      order.statusHistory.push({
        status: currentStatus,
        note,
        createdAt: new Date(),
      });
    }

    await order.save();

    const updated = await Order.findById(order._id)
      .populate("userId", "fullName email phone")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: {
        order: serializeOrder(updated),
      },
    });
  } catch (error) {
    console.error("ADMIN ORDER PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 }
    );
  }
}