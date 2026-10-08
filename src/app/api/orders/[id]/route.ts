import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Types } from "mongoose";

import { connectDB } from "@/src/lib/db";
import Order from "@/src/models/Order";

async function getUserId(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) return null;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return payload.userId
      ? String(payload.userId)
      : null;
  } catch {
    return null;
  }
}

function serializeOrder(order: any) {
  return {
    id: String(order._id),
    _id: String(order._id),

    orderNumber: order.orderNumber,

    items: order.items.map((item: any) => ({
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

    statusHistory: (order.statusHistory || []).map(
      (item: any) => ({
        status: item.status,
        note: item.note || "",
        createdAt: item.createdAt,
      })
    ),

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const userId = await getUserId(request);

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الطلب غير صالح.",
        },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      _id: id,
      userId,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود.",
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
    console.error("GET ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تحميل الطلب.",
      },
      { status: 500 }
    );
  }
}