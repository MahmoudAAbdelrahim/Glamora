import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/Product";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product id",
        },
        { status: 400 }
      );
    }

    await connectDB();

    /**
     * Public product:
     * - must be active
     * - deletedAt can be null OR missing
     */
    const product = await Product.findOne({
      _id: id,
      isActive: true,
      $or: [
        { deletedAt: null },
        { deletedAt: { $exists: false } },
      ],
    })
      .select(
        [
          "_id",
          "name",
          "brand",
          "category",
          "description",
          "price",
          "discountPrice",
          "currency",
          "images",
          "skinTypes",
          "concerns",
          "ingredients",
          "benefits",
          "howToUse",
          "suitableForAge",
          "shade",
          "size",
          "stock",
          "lowStockThreshold",
          "sku",
          "rating",
          "reviewsCount",
          "featured",
          "bestSeller",
          "isActive",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      data: {
        product: {
          ...product,
          id: product._id.toString(),
          _id: undefined,
        },
      },
    });
  } catch (error) {
    console.error(
      "PUBLIC_PRODUCT_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load product",
      },
      { status: 500 }
    );
  }
}