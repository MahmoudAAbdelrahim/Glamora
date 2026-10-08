import mongoose, { Document, Model, Schema } from "mongoose";

export type ProductCategory = "skincare" | "makeup";

export type SkinType =
  | "all"
  | "oily"
  | "dry"
  | "combination"
  | "normal"
  | "sensitive";

export type ProductConcern =
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

export type ProductImage = {
  url: string;
  publicId: string;
};

export interface IProduct extends Document {
  name: string;

  brand: string;

  category: ProductCategory;

  description: string;

  price: number;

  discountPrice?: number;

  currency: "EGP";

  images: ProductImage[];

  skinTypes: SkinType[];

  concerns: ProductConcern[];

  ingredients: string[];

  benefits: string[];

  howToUse: string;

  suitableForAge?: {
    min?: number;
    max?: number;
  };

  shade?: string;

  size?: string;

  stock: number;

  lowStockThreshold: number;

  sku?: string;

  rating: number;

  reviewsCount: number;

  featured: boolean;

  bestSeller: boolean;

  isActive: boolean;

  deletedAt?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

const ProductImageSchema = new Schema<ProductImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    category: {
      type: String,
      required: true,
      enum: ["skincare", "makeup"],
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: undefined,
    },

    currency: {
      type: String,
      enum: ["EGP"],
      default: "EGP",
    },

    images: {
      type: [ProductImageSchema],
      required: true,
      validate: {
        validator: function (images: ProductImage[]) {
          return (
            images.length >= 1 &&
            images.length <= 5
          );
        },

        message:
          "A product must have between 1 and 5 images.",
      },
    },

    skinTypes: {
      type: [
        {
          type: String,
          enum: [
            "all",
            "oily",
            "dry",
            "combination",
            "normal",
            "sensitive",
          ],
        },
      ],

      default: [],
    },

    concerns: {
      type: [
        {
          type: String,
          enum: [
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
          ],
        },
      ],

      default: [],
    },

    ingredients: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    howToUse: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    suitableForAge: {
      min: {
        type: Number,
        min: 0,
        max: 120,
      },

      max: {
        type: Number,
        min: 0,
        max: 120,
      },
    },

    shade: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    size: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    bestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

/*
 * Prevent invalid discount prices.
 */
ProductSchema.pre("save", function () {
  if (
    this.discountPrice != null &&
    this.discountPrice >= this.price
  ) {
    throw new Error(
      "Discount price must be lower than price"
    );
  }

  if (
    this.suitableForAge?.min != null &&
    this.suitableForAge?.max != null &&
    this.suitableForAge.min > this.suitableForAge.max
  ) {
    throw new Error(
      "Minimum age cannot be greater than maximum age"
    );
  }
});
const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>(
    "Product",
    ProductSchema
  );

export default Product;