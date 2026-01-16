import { eq, isNull, and } from "drizzle-orm";
import { users } from "~~/server/db/schema";
import { anonymizeCasesBelongingToUser } from "./case";
import { removeSolutionsByUserId } from "./solution";

export function updatePassword(userId: number, hashedPassword: string) {
  return db
    .update(users)
    .set({ password: hashedPassword })
    .where(and(eq(users.id, userId), isNull(users.removedAt)));
}

export function updateEmail(userId: number, email: string) {
  return db
    .update(users)
    .set({ email: email })
    .where(and(eq(users.id, userId), isNull(users.removedAt)));
}

export function setEmailVerified(userId: number) {
  return db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(and(eq(users.id, userId), isNull(users.removedAt)));
}

export async function removeUser(userId: number) {
  console.log("removing user", userId, "begin..");
  await db.transaction(async (tx) => {
    // remove all solutions by user id
    console.log("removing all solutions");
    await removeSolutionsByUserId(userId, tx);

    // anonymize all cases belonging to user
    console.log("removing all cases");
    await anonymizeCasesBelongingToUser(userId, tx);

    // remove user
    console.log("remove user");
    await tx
      .update(users)
      .set({ removedAt: new Date() })
      .where(eq(users.id, userId));
  });
  console.log("removing user", userId, "end..");
}

export function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.removedAt)),
    columns: { id: true },
  });
}

export function getUserPassword(id: number) {
  return db
    .select({
      password: users.password,
    })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.removedAt)));
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
    .where(and(eq(users.id, userId), isNull(users.removedAt)));
}

export function setVerifyEmailRequested(userId: number) {
  console.info("updating `email_verification_requested_at` on user..", userId);
  return db
    .update(users)
    .set({ email_verification_requested_at: new Date() })
    .where(and(eq(users.id, userId), isNull(users.removedAt)));
}
