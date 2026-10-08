import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "../../../../../lib/db";
import Product from "../../../../../models/Product";

type ProductCategory = "skincare" | "makeup";

type SkinType =
  | "all"
  | "oily"
  | "dry"
  | "combination"
  | "normal"
  | "sensitive";

type ProductConcern =
  | "acne"
  | "dark-spots"
  | "dryness"
  | "oiliness"
  | "wrinkles"
  | "fine-lines"
  | "redness"
  | "dullness"
  | "pores"
  | "dark-circles"
  | "uneven-tone"
  | "blackheads"
  | "blemishes"
  | "dehydration";

type ProductImageInput = {
  url: string;
  publicId: string;
};

const validCategories: ProductCategory[] = [
  "skincare",
  "makeup",
];

const validSkinTypes: SkinType[] = [
  "all",
  "oily",
  "dry",
  "combination",
  "normal",
  "sensitive",
];

const validConcerns: ProductConcern[] = [
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

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanImages(value: unknown): ProductImageInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (image): image is ProductImageInput =>
        typeof image === "object" &&
        image !== null &&
        typeof image.url === "string" &&
        typeof image.publicId === "string"
    )
    .map((image) => ({
      url: image.url.trim(),
      publicId: image.publicId.trim(),
    }))
    .filter(
      (image) =>
        image.url.length > 0 &&
        image.publicId.length > 0
    );
}

function normalizeNumber(value: unknown): number | undefined {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function normalizeBoolean(
  value: unknown,
  defaultValue = false
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return defaultValue;
}

/* =========================================================
   GET - List products for admin
========================================================= */

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

    const search =
      searchParams.get("search")?.trim() || "";

    const category =
      searchParams.get("category") || "all";

    const status =
      searchParams.get("status") || "all";

    const page = Math.max(
      Number.parseInt(
        searchParams.get("page") || "1",
        10
      ),
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          searchParams.get("limit") || "10",
          10
        ),
        1
      ),
      100
    );

    const query: Record<string, unknown> = {
      deletedAt: null,
    };

    /* Search */
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /* Category */
    if (
      category === "skincare" ||
      category === "makeup"
    ) {
      query.category = category;
    }

    /* Status */
    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    if (status === "outOfStock") {
      query.stock = 0;
    }

    if (status === "lowStock") {
      query.$expr = {
        $and: [
          {
            $gt: ["$stock", 0],
          },
          {
            $lte: [
              "$stock",
              "$lowStockThreshold",
            ],
          },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const [
      products,
      total,
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStock,
      lowStock,
    ] = await Promise.all([
      /*
       * any هنا مقصودة لتفادي مشكلة
       * Product.find().lean() -> never
       * في TypeScript مع الـ Mongoose model الحالي.
       */
      Product.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean<any>(),

      Product.countDocuments(query),

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
        stock: 0,
      }),

      Product.countDocuments({
        deletedAt: null,
        stock: {
          $gt: 0,
        },
        $expr: {
          $lte: [
            "$stock",
            "$lowStockThreshold",
          ],
        },
      }),
    ]);

    const totalPages = Math.max(
      Math.ceil(total / limit),
      1
    );

    return NextResponse.json({
      success: true,

      data: {
        products: products.map((product: any) => ({
          ...product,
          id: product._id.toString(),
          _id: undefined,
        })),

        pagination: {
          page,
          limit,
          total,
          totalPages,
        },

        stats: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          outOfStock,
          lowStock,
        },
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_PRODUCTS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load products",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST - Create new product
========================================================= */

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const name = cleanString(body.name);

    const brand = cleanString(body.brand);

    const description =
      cleanString(body.description);

    const category =
      cleanString(body.category) as ProductCategory;

    const images = cleanImages(body.images);

    /*
     * تحويل صريح للأنواع المطلوبة في Product model
     */
    const skinTypes =
      cleanStringArray(
        body.skinTypes
      ) as SkinType[];

    const concerns =
      cleanStringArray(
        body.concerns
      ) as ProductConcern[];

    const ingredients =
      cleanStringArray(body.ingredients);

    const benefits =
      cleanStringArray(body.benefits);

    const howToUse =
      cleanString(body.howToUse);

    const price =
      normalizeNumber(body.price);

    const discountPrice =
      normalizeNumber(body.discountPrice);

    const stock =
      normalizeNumber(body.stock) ?? 0;

    const lowStockThreshold =
      normalizeNumber(
        body.lowStockThreshold
      ) ?? 5;

    const ageMin =
      normalizeNumber(
        body.suitableForAge?.min
      );

    const ageMax =
      normalizeNumber(
        body.suitableForAge?.max
      );

    const sku =
      cleanString(body.sku);

    /* =========================
       Basic validation
    ========================= */

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: "Brand is required",
        },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product category",
        },
        { status: 400 }
      );
    }

    if (
      price === undefined ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Price must be greater than zero",
        },
        { status: 400 }
      );
    }

    /* =========================
       Discount validation
    ========================= */

    if (
      discountPrice !== undefined &&
      discountPrice >= price
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

    /* =========================
       Images validation
    ========================= */

    if (
      images.length < 1 ||
      images.length > 5
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

    /* =========================
       Stock validation
    ========================= */

    if (stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock cannot be negative",
        },
        { status: 400 }
      );
    }

    if (lowStockThreshold < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Low stock threshold cannot be negative",
        },
        { status: 400 }
      );
    }

    /* =========================
       Skin types validation
    ========================= */

    const invalidSkinType =
      skinTypes.some(
        (item) =>
          !validSkinTypes.includes(item)
      );

    if (invalidSkinType) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid skin type",
        },
        { status: 400 }
      );
    }

    /* =========================
       Concerns validation
    ========================= */

    const invalidConcern =
      concerns.some(
        (item) =>
          !validConcerns.includes(item)
      );

    if (invalidConcern) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid concern",
        },
        { status: 400 }
      );
    }

    /* =========================
       Age validation
    ========================= */

    if (
      ageMin !== undefined &&
      ageMax !== undefined &&
      ageMin > ageMax
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

    /* =========================
       SKU validation
    ========================= */

    if (sku) {
      const normalizedSku =
        sku.toUpperCase();

      const existingSku =
        await Product.findOne({
          sku: normalizedSku,
          deletedAt: null,
        });

      if (existingSku) {
        return NextResponse.json(
          {
            success: false,
            message: "SKU already exists",
          },
          { status: 409 }
        );
      }
    }

    /* =========================
       Create product
    ========================= */

    const product =
      await Product.create({
        name,
        brand,
        category,
        description,

        price,
        discountPrice,

        currency: "EGP",

        images,

        skinTypes,
        concerns,

        ingredients,
        benefits,
        howToUse,

        suitableForAge: {
          ...(ageMin !== undefined
            ? { min: ageMin }
            : {}),

          ...(ageMax !== undefined
            ? { max: ageMax }
            : {}),
        },

        shade: cleanString(
          body.shade
        ),

        size: cleanString(
          body.size
        ),

        stock,
        lowStockThreshold,

        ...(sku
          ? {
              sku: sku.toUpperCase(),
            }
          : {}),

        rating: 0,
        reviewsCount: 0,

        featured: normalizeBoolean(
          body.featured
        ),

        bestSeller: normalizeBoolean(
          body.bestSeller
        ),

        isActive: normalizeBoolean(
          body.isActive,
          true
        ),

        deletedAt: null,
      });

    /* =========================
       Response
    ========================= */

    return NextResponse.json(
      {
        success: true,

        message:
          "Product created successfully",

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

            currency:
              product.currency,

            images:
              product.images,

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

            shade:
              product.shade,

            size:
              product.size,

            stock:
              product.stock,

            lowStockThreshold:
              product.lowStockThreshold,

            sku:
              product.sku,

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

            createdAt:
              product.createdAt,

            updatedAt:
              product.updatedAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN_PRODUCTS_POST_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}
