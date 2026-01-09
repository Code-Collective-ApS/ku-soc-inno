import { eq } from "drizzle-orm";
import { users } from "~~/server/db/schema";

export function updatePassword(userId: number, hashedPassword: string) {
  return db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}

export function updateEmail(userId: number, email: string) {
  return db.update(users).set({ email: email }).where(eq(users.id, userId));
}

export function setEmailVerified(userId: number) {
  return db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, userId));
}

export function deleteUserAccount(userId: number) {
  return db.delete(users).where(eq(users.id, userId));
}

export function setForgotPasswordRequested(userId: number) {
  console.info(
    "updating `forgot_password_requested_at` on user..",
    userId,
    "to",
    new Date(),
  );
  return db
    .update(users)
    .set({ forgot_password_requested_at: new Date() })
    .where(eq(users.id, userId));
}

export function setVerifyEmailRequested(userId: number) {
  console.info("updating `email_verification_requested_at` on user..", userId);
  return db
    .update(users)
    .set({ email_verification_requested_at: new Date() })
    .where(eq(users.id, userId));
}
