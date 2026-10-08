import { SignJWT, jwtVerify } from "jose";
import { Types } from "mongoose";

export type AuthPayload = {
  userId: string;
  role: "user" | "admin";
};

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function createAccessToken(payload: AuthPayload) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  const userId = payload.userId;
  const role = payload.role;

  if (
    typeof userId !== "string" ||
    !Types.ObjectId.isValid(userId)
  ) {
    throw new Error("Invalid user ID");
  }

  if (role !== "user" && role !== "admin") {
    throw new Error("Invalid role");
  }

  return {
    userId,
    role,
  };
}