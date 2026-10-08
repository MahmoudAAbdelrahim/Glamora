import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISiteReview extends Document {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteReviewSchema = new Schema<ISiteReview>(
  {
    /* تقييم واحد لكل مستخدم (لو قيّم تاني بيتعدّل تقييمه القديم) */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    name: { type: String, required: true, trim: true, maxlength: 80 },

    rating: { type: Number, required: true, min: 1, max: 5 },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 600,
    },

    /* تقدر تخفي أي تقييم من الأدمن بـ isVisible = false */
    isVisible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const SiteReview: Model<ISiteReview> =
  mongoose.models.SiteReview ||
  mongoose.model<ISiteReview>("SiteReview", SiteReviewSchema);

export default SiteReview;