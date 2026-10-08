import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";

import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/Product";
import UserStore from "@/src/models/UserStore";

async function getUserId(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json({
        success: true,
        data: {
          favorites: [],
        },
      });
    }

    await connectDB();

    const store = await UserStore.findOne({
      userId,
    }).lean();

    return NextResponse.json({
      success: true,
      data: {
        favorites: (store?.favorites || []).map(String),
      },
    });
  } catch (error) {
    console.error("FAVORITES_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load favorites",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = String(body.productId || "");

    if (!isValidObjectId(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product id",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      deletedAt: null,
    }).select("_id");

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const store = await UserStore.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          favorites: product._id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      data: {
        favorites: (store?.favorites || []).map(String),
      },
    });
  } catch (error) {
    console.error("FAVORITES_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add favorite",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = String(body.productId || "");

    if (!isValidObjectId(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product id",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const store = await UserStore.findOneAndUpdate(
      { userId },
      {
        $pull: {
          favorites: productId,
        },
      },
      {
        new: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      data: {
        favorites: (store?.favorites || []).map(String),
      },
    });
  } catch (error) {
    console.error("FAVORITES_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove favorite",
      },
      { status: 500 }
    );
  }
}