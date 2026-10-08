import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";

import {connectDB} from "../../../../../../lib/db";
import Product from "../../../../../../models/Product";

const validCategories = [
  "skincare",
  "makeup",
];

const validSkinTypes = [
  "all",
  "oily",
  "dry",
  "combination",
  "normal",
  "sensitive",
];

const validConcerns = [
  "acne",
  "dark-spots",
  "dryness",
  "oiliness",
  "wrinkles",
  "fine-lines",
  "redness",
  "dullness",
  "pores",
  "dark-circles",
  "uneven-tone",
  "blackheads",
  "blemishes",
  "dehydration",
];

async function requireAdmin(
  request: NextRequest
) {
  const token =
    request.cookies.get("accessToken")?.value;

  if (!token) return null;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (
      payload.role !== "admin" ||
      !payload.userId
    ) {
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

function stringValue(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : undefined;
}

function numberValue(
  value: unknown
) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function booleanValue(
  value: unknown
) {
  return typeof value === "boolean"
    ? value
    : undefined;
}

function arrayValue(
  value: unknown
) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

/*
 * PATCH
 */
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const admin =
      await requireAdmin(request);

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
          message:
            "Invalid product ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const product =
      await Product.findOne({
        _id: id,
        deletedAt: null,
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found",
        },
        { status: 404 }
      );
    }

    const body =
      await request.json();

    if (body.name !== undefined) {
      const name = stringValue(
        body.name
      );

      if (!name || name.length < 2) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product name",
          },
          { status: 400 }
        );
      }

      product.name = name;
    }

    if (body.brand !== undefined) {
      const brand = stringValue(
        body.brand
      );

      if (!brand) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Brand is required",
          },
          { status: 400 }
        );
      }

      product.brand = brand;
    }

    if (body.category !== undefined) {
      if (
        !validCategories.includes(
          body.category
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid category",
          },
          { status: 400 }
        );
      }

      product.category =
        body.category;
    }

    if (
      body.description !== undefined
    ) {
      product.description =
        stringValue(
          body.description
        ) || "";
    }

    if (body.price !== undefined) {
      const price =
        numberValue(body.price);

      if (
        price === undefined ||
        price <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid price",
          },
          { status: 400 }
        );
      }

      product.price = price;
    }

    if (
      body.discountPrice !== undefined
    ) {
      const discountPrice =
        numberValue(
          body.discountPrice
        );

      if (
        discountPrice !== undefined &&
        discountPrice >= product.price
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Discount price must be lower than original price",
          },
          { status: 400 }
        );
      }

      product.discountPrice =
        discountPrice;
    }

    if (body.images !== undefined) {
      if (
        !Array.isArray(body.images) ||
        body.images.length < 1 ||
        body.images.length > 5
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product must have between 1 and 5 images",
          },
          { status: 400 }
        );
      }

      const images = body.images.filter(
        (
          image: unknown
        ): image is {
          url: string;
          publicId: string;
        } =>
          typeof image ===
            "object" &&
          image !== null &&
          typeof (
            image as {
              url?: unknown;
            }
          ).url === "string" &&
          typeof (
            image as {
              publicId?: unknown;
            }
          ).publicId === "string"
      );

      if (images.length !== body.images.length) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product images",
          },
          { status: 400 }
        );
      }

      product.images = images;
    }

    if (
      body.skinTypes !== undefined
    ) {
      const skinTypes =
        arrayValue(
          body.skinTypes
        ) || [];

      if (
        skinTypes.some(
          (item) =>
            !validSkinTypes.includes(
              item
            )
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid skin type",
          },
          { status: 400 }
        );
      }

      product.skinTypes =
        skinTypes as typeof product.skinTypes;
    }

    if (
      body.concerns !== undefined
    ) {
      const concerns =
        arrayValue(
          body.concerns
        ) || [];

      if (
        concerns.some(
          (item) =>
            !validConcerns.includes(
              item
            )
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid concern",
          },
          { status: 400 }
        );
      }

      product.concerns =
        concerns as typeof product.concerns;
    }

    if (
      body.ingredients !== undefined
    ) {
      product.ingredients =
        arrayValue(
          body.ingredients
        ) || [];
    }

    if (
      body.benefits !== undefined
    ) {
      product.benefits =
        arrayValue(
          body.benefits
        ) || [];
    }

    if (
      body.howToUse !== undefined
    ) {
      product.howToUse =
        stringValue(
          body.howToUse
        ) || "";
    }

    if (
      body.suitableForAge !==
      undefined
    ) {
      const min =
        numberValue(
          body.suitableForAge?.min
        );

      const max =
        numberValue(
          body.suitableForAge?.max
        );

      if (
        min !== undefined &&
        max !== undefined &&
        min > max
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Minimum age cannot be greater than maximum age",
          },
          { status: 400 }
        );
      }

      product.suitableForAge = {
        ...(min !== undefined
          ? { min }
          : {}),
        ...(max !== undefined
          ? { max }
          : {}),
      };
    }

    if (body.shade !== undefined) {
      product.shade =
        stringValue(body.shade);
    }

    if (body.size !== undefined) {
      product.size =
        stringValue(body.size);
    }

    if (body.stock !== undefined) {
      const stock =
        numberValue(body.stock);

      if (
        stock === undefined ||
        stock < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid stock",
          },
          { status: 400 }
        );
      }

      product.stock = stock;
    }

    if (
      body.lowStockThreshold !==
      undefined
    ) {
      const threshold =
        numberValue(
          body.lowStockThreshold
        );

      if (
        threshold === undefined ||
        threshold < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid low stock threshold",
          },
          { status: 400 }
        );
      }

      product.lowStockThreshold =
        threshold;
    }

    if (body.sku !== undefined) {
      const sku =
        stringValue(body.sku);

      if (sku) {
        const existing =
          await Product.findOne({
            sku: sku.toUpperCase(),
            _id: {
              $ne: id,
            },
            deletedAt: null,
          });

        if (existing) {
          return NextResponse.json(
            {
              success: false,
              message:
                "SKU already exists",
            },
            { status: 409 }
          );
        }

        product.sku =
          sku.toUpperCase();
      } else {
        product.sku = undefined;
      }
    }

    const featured =
      booleanValue(body.featured);

    if (featured !== undefined) {
      product.featured =
        featured;
    }

    const bestSeller =
      booleanValue(
        body.bestSeller
      );

    if (bestSeller !== undefined) {
      product.bestSeller =
        bestSeller;
    }

    const isActive =
      booleanValue(
        body.isActive
      );

    if (isActive !== undefined) {
      product.isActive =
        isActive;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message:
        "Product updated successfully",

      data: {
        product: {
          id: product._id.toString(),
          name: product.name,
          brand: product.brand,
          category: product.category,
          description:
            product.description,
          price: product.price,
          discountPrice:
            product.discountPrice,
          images: product.images,
          skinTypes:
            product.skinTypes,
          concerns:
            product.concerns,
          ingredients:
            product.ingredients,
          benefits:
            product.benefits,
          howToUse:
            product.howToUse,
          suitableForAge:
            product.suitableForAge,
          shade: product.shade,
          size: product.size,
          stock: product.stock,
          lowStockThreshold:
            product.lowStockThreshold,
          sku: product.sku,
          rating:
            product.rating,
          reviewsCount:
            product.reviewsCount,
          featured:
            product.featured,
          bestSeller:
            product.bestSeller,
          isActive:
            product.isActive,
          updatedAt:
            product.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_PRODUCT_PATCH_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update product",
      },
      { status: 500 }
    );
  }
}

/*
 * DELETE
 * Soft delete.
 */
export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const admin =
      await requireAdmin(request);

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
          message:
            "Invalid product ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const product =
      await Product.findOne({
        _id: id,
        deletedAt: null,
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found",
        },
        { status: 404 }
      );
    }

    product.deletedAt =
      new Date();

    product.isActive = false;

    await product.save();

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "ADMIN_PRODUCT_DELETE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
/*
 * ============================================================
 * الصق الدالة دي في آخر ملف:
 *   app/api/admin/dashboard/products/[id]/route.ts   (بعد دالة DELETE)
 *
 * مفيش imports جديدة مطلوبة، كلهم موجودين عندك فوق في نفس الملف
 * (NextRequest, NextResponse, isValidObjectId, connectDB, Product, requireAdmin, Context).
 * ============================================================
 */

/*
 * GET: تفاصيل منتج واحد (للأدمن) — بتستخدمها صفحة التفاصيل وصفحة التعديل
 */
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findOne({
      _id: id,
      deletedAt: null,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: String(product._id),
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          currency: product.currency,
          images: product.images,
          skinTypes: product.skinTypes,
          concerns: product.concerns,
          ingredients: product.ingredients,
          benefits: product.benefits,
          howToUse: product.howToUse,
          suitableForAge: product.suitableForAge,
          shade: product.shade,
          size: product.size,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          sku: product.sku,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          featured: product.featured,
          bestSeller: product.bestSeller,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN_PRODUCT_GET_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load product" },
      { status: 500 }
    );
  }
}