import { users } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  email: z.email(),
});

const EmailValidity = 1000 * 60 * 5; // 5 minutes

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, bodySchema.parse);

  const beginTime = new Date().getTime();

  const userRes = await db
    .select({
      email: users.email,
      password: users.password,
      id: users.id,
      emailVerifiedAt: users.emailVerifiedAt,
      forgotPasswordAt: users.email_verification_requested_at,
    })
    .from(users)
    .where(eq(users.email, email));

  // ensure user exists
  if (!userRes[0]) {
    console.log("User does not exist");
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      statusMessage: "Wrong email or password",
    });
  }

  const user = userRes[0]!;

  // ensure user does not spam us
  if (user.forgotPasswordAt) {
    if (Date.now() < user.forgotPasswordAt.getTime() + EmailValidity) {
      await waitABit(beginTime);
      throw createError({
        statusCode: 400,
        statusMessage:
          "You cannot request a new email, as long as the last one is active",
      });
    }
  }

  // TODO: send forgot password email

  // update database
  console.info("updating `forgot_password_requested_at` on user..");
  await db
    .update(users)
    .set({ forgot_password_requested_at: new Date() })
    .where(eq(users.id, user.id));

  console.info("forgot-password-email endpoint finish");

  return { success: true };
});
