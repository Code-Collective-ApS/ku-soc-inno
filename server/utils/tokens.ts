import { eq } from "drizzle-orm";
import { tokens } from "../db/schema";
import crypto from "crypto";
import { createError } from "h3";

export const VerifyEmailTokenMinIntervalMs = 5 * 60 * 1000; // 5 minutes
export const ForgotPasswordTokenMinIntervalMs = 15 * 60 * 1000; // 15 minutes
export const ForgotPasswordTokenExpiresMs = 15 * 60 * 1000; // 15 minutes
export const VerifyEmailTokenExpiresMs = 14 * 24 * 60 * 60 * 1000; // 2 weeks

type TokenResponse = {
  id: number;
  userId: number;
  tokenType: string;
  usedAt: Date | string | null;
  expiresAt: Date | string;
  token: string;
};

type TokenType = "verify_email" | "reset_password";
export const TokenTypes: Record<TokenType, TokenType> = {
  reset_password: "reset_password",
  verify_email: "verify_email",
};

function makeRandomToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function hashToken(raw: string): string {
  return crypto.createHash("sha512").update(raw).digest("hex");
}

export async function createToken(
  tokenType: TokenType,
  userId: number,
  expiresInSeconds: number,
): Promise<{ id: number; token: string }> {
  const randomToken = makeRandomToken();
  const hashedToken = hashToken(randomToken);
  const expiresAt = new Date(Date.now() + Math.floor(expiresInSeconds * 1000));
  const result = await db
    .insert(tokens)
    .values({
      tokenType: tokenType,
      userId: userId,
      token: hashedToken,
      expiresAt: expiresAt,
    })
    .returning({
      id: tokens.id,
      token: tokens.token,
    });
  return result[0]!;
}

export async function useToken(rawToken: string) {
  await db
    .update(tokens)
    .set({
      usedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tokens.token, rawToken));
}

export async function requireTokenByToken(rawToken: string) {
  const t = await db.query.tokens.findFirst({
    columns: {
      id: true,
      tokenType: true,
      usedAt: true,
      expiresAt: true,
      userId: true,
      token: true,
    },
    where: eq(tokens.token, rawToken),
  });

  if (!t) {
    // TODO: report error
    throw createError({
      statusCode: 404,
      statusMessage: "Token does not exist",
    });
  }

  return t;
}

/**
 * verify token validity (usedAt, tokenType, expiresAt)
 * NOTE: this function will throw errors if verification fails
 */
export async function verifyToken(
  t: TokenResponse,
  expectedTokenType: TokenType,
): Promise<void> {
  const expiresAt =
    t.expiresAt instanceof Date ? t.expiresAt : new Date(t.expiresAt);

  if (t.tokenType !== expectedTokenType) {
    console.log(t.tokenType, "!==", expectedTokenType);
    throw new Error("Token type is invalid");
  } else if (t.usedAt) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Linket er allerede brugt og virker kun 1 gang. Start venligst forfra.",
    });
  } else if (expiresAt.getTime() < Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Linket er udløbet og ændringen kan ikke gennemføres. Start venligst forfra.",
    });
  }
}

export async function createResetPasswordToken(userId: number) {
  return createToken("reset_password", userId, ForgotPasswordTokenExpiresMs);
}

export async function createVerifyEmailToken(userId: number) {
  return createToken("verify_email", userId, VerifyEmailTokenExpiresMs);
}

export function generateResetPasswordUrl(
  baseUrl: string,
  email: string,
  resetPasswordToken: string,
) {
  return `${baseUrl}/reset-password?email=${toBase64Url(email)}&token=${resetPasswordToken}`;
}

export function generateResetEmailUrl(
  baseUrl: string,
  email: string,
  resetEmailToken: string,
) {
  return `${baseUrl}/account-automatic-verification?email=${toBase64Url(email)}&token=${resetEmailToken}`;
}
