import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Types } from "mongoose";

import { connectDB } from "@/src/lib/db";
import User from "@/src/models/User";
import UserStore from "@/src/models/UserStore";
import Product from "@/src/models/Product";
import Order from "@/src/models/Order";

const SHIPPING_FEE = 60;

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

    if (!payload.userId) return null;

    return String(payload.userId);
  } catch {
    return null;
  }
}

function makeOrderNumber() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `GL-${year}${month}${day}-${random}`;
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserId(request);

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولًا.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId)
      .select(
        "_id fullName email phone address city isBlocked deletedAt"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير موجود.",
        },
        { status: 404 }
      );
    }

    if (user.isBlocked || user.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الحساب غير متاح حاليًا.",
        },
        { status: 403 }
      );
    }

    let body: any = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const shippingAddress = body?.shippingAddress;

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات عنوان الشحن مطلوبة.",
        },
        { status: 400 }
      );
    }

    const fullName = String(
      shippingAddress.fullName || user.fullName || ""
    ).trim();

    const phone = String(
      shippingAddress.phone || user.phone || ""
    ).trim();

    const governorate = String(
      shippingAddress.governorate || ""
    ).trim();

    const city = String(
      shippingAddress.city || user.city || ""
    ).trim();

    const address = String(
      shippingAddress.address || user.address || ""
    ).trim();

    const notes = String(
      shippingAddress.notes || ""
    ).trim();

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "الاسم غير موجود في بيانات الحساب.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف غير موجود في بيانات الحساب.",
        },
        { status: 400 }
      );
    }

    if (!governorate) {
      return NextResponse.json(
        {
          success: false,
          message: "اختر المحافظة.",
        },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message: "المدينة مطلوبة.",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "العنوان مطلوب.",
        },
        { status: 400 }
      );
    }

    const store = await UserStore.findOne({
      userId,
    }).lean<{
      cart?: Array<{
        productId: Types.ObjectId;
        quantity: number;
      }>;
    }>();

    const cartItems = store?.cart || [];

    if (!cartItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "السلة فارغة.",
        },
        { status: 400 }
      );
    }

    const productIds = cartItems.map(
      (item) => item.productId
    );

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      deletedAt: null,
    })
      .select(
        "_id name brand price discountPrice images stock"
      )
      .lean();

    const productMap = new Map(
      products.map((product: any) => [
        String(product._id),
        product,
      ])
    );

    const orderItems: any[] = [];

    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = productMap.get(
        String(cartItem.productId)
      );

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "يوجد منتج في السلة لم يعد متاحًا.",
          },
          { status: 400 }
        );
      }

      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "كمية منتج غير صالحة.",
          },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `الكمية المطلوبة من "${product.name}" غير متوفرة. المتاح: ${product.stock}.`,
          },
          { status: 400 }
        );
      }

      const unitPrice =
        product.discountPrice != null
          ? Number(product.discountPrice)
          : Number(product.price);

      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        brand: product.brand || "",
        image: product.images?.[0]?.url || "",
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    const total =
      Math.round(
        (subtotal + SHIPPING_FEE) * 100
      ) / 100;

    // خصم الكميات من المخزون بشكل آمن
    for (const item of orderItems) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
            isActive: true,
            deletedAt: null,
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        return NextResponse.json(
          {
            success: false,
            message:
              `المنتج "${item.name}" لم تعد الكمية المطلوبة منه متاحة.`,
          },
          { status: 409 }
        );
      }
    }

    const order = await Order.create({
      userId: new Types.ObjectId(userId),

      orderNumber: makeOrderNumber(),

      items: orderItems,

      shippingAddress: {
        fullName,
        phone,
        governorate,
        city,
        address,
        notes,
      },

      subtotal,

      shipping: SHIPPING_FEE,

      total,

      paymentMethod: "cod",

      status: "pending",

      statusHistory: [
        {
          status: "pending",
          note: "تم إنشاء الطلب بنجاح.",
          createdAt: new Date(),
        },
      ],
    });

    // تفريغ السلة بعد إنشاء الطلب
    await UserStore.updateOne(
      { userId },
      {
        $set: {
          cart: [],
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الطلب بنجاح.",
        data: {
          order: serializeOrder(order),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء الطلب.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const orders = await Order.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map(serializeOrder),
      },
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تحميل الطلبات.",
      },
      { status: 500 }
    );
  }
}