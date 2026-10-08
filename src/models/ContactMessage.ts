import mongoose, { Schema, model, models } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage =
  models.ContactMessage ||
  model("ContactMessage", ContactMessageSchema);

export default ContactMessage;