import mongoose, {
  Schema,
  type Model,
} from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const UserStoreSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    cart: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const UserStore =
  (mongoose.models.UserStore as Model<any>) ||
  mongoose.model("UserStore", UserStoreSchema);

export default UserStore;