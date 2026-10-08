import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/Product";

const VALID_CATEGORIES = ["skincare", "makeup"];
const VALID_SKIN_TYPES = ["all", "oily", "dry", "combination", "normal", "sensitive"];
const VALID_CONCERNS = [
  "acne", "dark-spots", "dryness", "oiliness", "wrinkles", "fine-lines", "redness",
  "dullness", "pores", "dark-circles", "uneven-tone", "blackheads", "blemishes", "dehydration",
];

/** "oily,dry" -> ["oily","dry"] (only values that are allowed) */
function list(value: string | null, allowed?: string[]) {
  const items = (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed ? items.filter((item) => allowed.includes(item)) : items;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const skinTypes = list(searchParams.get("skinType"), VALID_SKIN_TYPES);
    const concerns = list(searchParams.get("concern"), VALID_CONCERNS);
    const brands = list(searchParams.get("brand"));
    const minPriceParam = searchParams.get("minPrice")?.trim() || "";
    const maxPriceParam = searchParams.get("maxPrice")?.trim() || "";
    const sort = searchParams.get("sort") || "newest";

    const pageValue = Number(searchParams.get("page"));
    const limitValue = Number(searchParams.get("limit"));
    const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;
    const limit =
      Number.isFinite(limitValue) && limitValue > 0 ? Math.min(Math.floor(limitValue), 50) : 12;

    // Public visibility rules (also used to build the brand list / price range)
    const baseFilters: Record<string, unknown>[] = [
      { isActive: true },
      { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
    ];

    const andFilters: Record<string, unknown>[] = [...baseFilters];

    if (search) {
      const regex = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      andFilters.push({
        $or: [{ name: regex }, { brand: regex }, { sku: regex }, { description: regex }],
      });
    }

    if (VALID_CATEGORIES.includes(category)) andFilters.push({ category });
    if (skinTypes.length) andFilters.push({ skinTypes: { $in: ["all", ...skinTypes] } });
    if (concerns.length) andFilters.push({ concerns: { $in: concerns } });
    if (brands.length) andFilters.push({ brand: { $in: brands } });

    // ?ids=a,b,c  (used by the favorites page)
    const ids = list(searchParams.get("ids")).filter((id) => isValidObjectId(id));
    if (searchParams.get("ids") !== null) andFilters.push({ _id: { $in: ids } });

    const minPrice = minPriceParam !== "" ? Number(minPriceParam) : undefined;
    const maxPrice = maxPriceParam !== "" ? Number(maxPriceParam) : undefined;
    const hasMin = minPrice !== undefined && Number.isFinite(minPrice);
    const hasMax = maxPrice !== undefined && Number.isFinite(maxPrice);

    if (hasMin || hasMax) {
      const priceFilter: Record<string, number> = {};
      if (hasMin) priceFilter.$gte = minPrice!;
      if (hasMax) priceFilter.$lte = maxPrice!;

      andFilters.push({
        $or: [
          { discountPrice: priceFilter },
          { discountPrice: null, price: priceFilter },
          { discountPrice: { $exists: false }, price: priceFilter },
        ],
      });
    }

    const filter = { $and: andFilters };

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price-low") sortQuery = { price: 1 };
    if (sort === "price-high") sortQuery = { price: -1 };
    if (sort === "rating") sortQuery = { rating: -1, reviewsCount: -1 };
    if (sort === "best-selling") sortQuery = { bestSeller: -1, createdAt: -1 };
    if (sort === "featured") sortQuery = { featured: -1, createdAt: -1 };

    const [products, total, brandList, priceStats] = await Promise.all([
      Product.find(filter)
        .select(
          [
            "_id", "name", "brand", "category", "description", "price", "discountPrice",
            "currency", "images", "skinTypes", "concerns", "ingredients", "benefits",
            "howToUse", "suitableForAge", "shade", "size", "stock", "lowStockThreshold",
            "sku", "rating", "reviewsCount", "featured", "bestSeller", "isActive",
            "createdAt", "updatedAt",
          ].join(" ")
        )
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),

      // Real brands that exist in your store
      Product.distinct("brand", { $and: baseFilters }),

      // Highest effective price (for the budget slider)
      Product.aggregate([
        { $match: { $and: baseFilters } },
        { $group: { _id: null, max: { $max: { $ifNull: ["$discountPrice", "$price"] } } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((product) => ({
          ...product,
          id: product._id.toString(),
          _id: undefined,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
        filters: {
          brands: (brandList as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b)),
          maxPrice: priceStats?.[0]?.max ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("PUBLIC_PRODUCTS_GET_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load products" },
      { status: 500 }
    );
  }
}