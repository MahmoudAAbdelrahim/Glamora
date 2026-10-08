import mongoose, {
  Schema,
  models,
  model,
  type Document,
} from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;

  role: UserRole;

  profileImage: {
    url: string;
    publicId: string;
  };

  address: {
    governorate: string;
    city: string;
    area: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
    postalCode: string;
    notes: string;
  };

  isBlocked: boolean;
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    governorate: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    street: {
      type: String,
      default: "",
      trim: true,
    },

    building: {
      type: String,
      default: "",
      trim: true,
    },

    floor: {
      type: String,
      default: "",
      trim: true,
    },

    apartment: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    profileImage: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    address: {
      type: AddressSchema,
      default: () => ({}),
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default models.User || model<IUser>("User", UserSchema);