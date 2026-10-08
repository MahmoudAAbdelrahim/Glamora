import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  isValidObjectId,
  Types,
} from "mongoose";

import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/Product";
import UserStore from "@/src/models/UserStore";

type CartItem = {
  productId: Types.ObjectId;
  quantity: number;
};

type CartProduct = {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  price: number;
  discountPrice?: number;
  currency: string;
  images: Array<{
    url: string;
    publicId: string;
  }>;
  stock: number;
  size?: string;
  shade?: string;
};

async function getUserId(
  request: NextRequest
): Promise<string | null> {
  const token =
    request.cookies.get("accessToken")?.value;

  if (!token) {
    return null;
  }

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

    if (!payload.userId) {
      return null;
    }

    return String(payload.userId);
  } catch {
    return null;
  }
}

async function getCartResponse(
  userId: string
) {
  const store = await UserStore.findOne({
    userId,
  }).lean<{
    cart?: CartItem[];
  }>();

  const items: CartItem[] = store?.cart ?? [];

  const productIds = items.map(
    (item: CartItem) => item.productId
  );

  if (productIds.length === 0) {
    return [];
  }

  const products =
    await Product.find({
      _id: {
        $in: productIds,
      },
      isActive: true,
      deletedAt: null,
    })
      .select(
        "_id name brand price discountPrice currency images stock size shade"
      )
      .lean<CartProduct[]>();

  const productMap = new Map<
    string,
    CartProduct
  >(
    products.map(
      (product: CartProduct) => [
        product._id.toString(),
        product,
      ]
    )
  );

  const cart = items
    .map((item: CartItem) => {
      const product =
        productMap.get(
          item.productId.toString()
        );

      if (!product) {
        return null;
      }

      return {
        product: {
          ...product,
          id: product._id.toString(),
          _id: undefined,
        },
        quantity: item.quantity,
      };
    })
    .filter(
      (
        item
      ): item is {
        product: Omit<CartProduct, "_id"> & {
          id: string;
          _id: undefined;
        };
        quantity: number;
      } => item !== null
    );

  return cart;
}

/* =========================================================
   GET CART
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const userId =
      await getUserId(request);

    if (!userId) {
      return NextResponse.json({
        success: true,
        data: {
          cart: [],
        },
      });
    }

    await connectDB();

    const cart =
      await getCartResponse(userId);

    return NextResponse.json({
      success: true,
      data: {
        cart,
      },
    });
  } catch (error) {
    console.error(
      "CART_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load cart",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   ADD TO CART
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const userId =
      await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      String(body.productId || "");

    const requestedQuantity =
      Number(body.quantity ?? 1);

    if (!isValidObjectId(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product id",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(
        requestedQuantity
      ) ||
      requestedQuantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
        deletedAt: null,
      }).select("_id stock");

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product is out of stock",
        },
        { status: 409 }
      );
    }

    const store =
      (await UserStore.findOne({
        userId,
      })) ||
      new UserStore({
        userId,
        favorites: [],
        cart: [],
      });

    const existing =
      store.cart.find(
        (item: CartItem) =>
          item.productId.toString() ===
          productId
      );

    if (existing) {
      const nextQuantity =
        existing.quantity +
        requestedQuantity;

      if (
        nextQuantity >
        product.stock
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Requested quantity exceeds stock",
          },
          { status: 409 }
        );
      }

      existing.quantity =
        nextQuantity;
    } else {
      if (
        requestedQuantity >
        product.stock
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Requested quantity exceeds stock",
          },
          { status: 409 }
        );
      }

      store.cart.push({
        productId:
          product._id,
        quantity:
          requestedQuantity,
      });
    }

    await store.save();

    const cart =
      await getCartResponse(userId);

    return NextResponse.json({
      success: true,
      data: {
        cart,
      },
    });
  } catch (error) {
    console.error(
      "CART_POST_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add product to cart",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   UPDATE CART ITEM
========================================================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    const userId =
      await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      String(body.productId || "");

    const quantity =
      Number(body.quantity);

    if (!isValidObjectId(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product id",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const product =
      await Product.findOne({
        _id: productId,
        isActive: true,
        deletedAt: null,
      }).select("_id stock");

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    if (
      quantity >
      product.stock
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Requested quantity exceeds stock",
        },
        { status: 409 }
      );
    }

    const store =
      await UserStore.findOne({
        userId,
      });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    const item =
      store.cart.find(
        (cartItem: CartItem) =>
          cartItem.productId.toString() ===
          productId
      );

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cart item not found",
        },
        { status: 404 }
      );
    }

    item.quantity = quantity;

    await store.save();

    const cart =
      await getCartResponse(userId);

    return NextResponse.json({
      success: true,
      data: {
        cart,
      },
    });
  } catch (error) {
    console.error(
      "CART_PATCH_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update cart",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE CART ITEM
========================================================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    const userId =
      await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      String(body.productId || "");

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

    await UserStore.findOneAndUpdate(
      { userId },
      {
        $pull: {
          cart: {
            productId:
              new Types.ObjectId(
                productId
              ),
          },
        },
      },
      {
        new: true,
      }
    );

    const cart =
      await getCartResponse(userId);

    return NextResponse.json({
      success: true,
      data: {
        cart,
      },
    });
  } catch (error) {
    console.error(
      "CART_DELETE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}