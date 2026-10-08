/*
 * ضعه في: app/api/site-reviews/route.ts   (غيّر الاسم لـ route.ts)
 *
 * مسارات الـ imports على نفس عمق مشروعك (lib و models في الـ root):
 *   app/api/site-reviews/route.ts  ->  ../../../lib/db
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import SiteReview from "../../../models/SiteReview";

/* ---------- المستخدم الحالي من الكوكي (نفس طريقة الأدمن) ---------- */
async function getUserId(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.userId ? String(payload.userId) : null;
  } catch {
    return null;
  }
}

/* الاسم بيتاخد من بيانات التسجيل — عدّل أسماء الحقول لو الـ User عندك مختلف */
function displayName(user: any) {
  return (
    user?.name ||
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    (user?.email ? String(user.email).split("@")[0] : "") ||
    "Glamora Customer"
  );
}

/* ================= GET: عرض التقييمات (عام) ================= */
export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(
      Math.max(Number(request.nextUrl.searchParams.get("limit")) || 30, 1),
      100
    );

    await connectDB();

    const [reviews, agg] = await Promise.all([
      SiteReview.find({ isVisible: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      SiteReview.aggregate([
        { $match: { isVisible: true } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map((r: any) => ({
          id: String(r._id),
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
        stats: {
          average: agg[0] ? Math.round(agg[0].average * 10) / 10 : 0,
          count: agg[0]?.count ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("SITE_REVIEWS_GET_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

/* ================= POST: إضافة / تعديل تقييمي (للمسجّل فقط) ================= */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length < 3 || comment.length > 600) {
      return NextResponse.json(
        { success: false, message: "Comment must be between 3 and 600 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const user: any = await User.findById(userId).lean();

    if (!user || user.isBlocked || user.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const review: any = await SiteReview.findOneAndUpdate(
      { user: userId },
      { $set: { name: displayName(user), rating, comment, isVisible: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        message: "Review saved",
        data: {
          review: {
            id: String(review._id),
            name: review.name,
            rating: review.rating,
            comment: review.comment,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SITE_REVIEWS_POST_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save review" },
      { status: 500 }
    );
  }
}