import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
const msPrMinute = 1000 * 60;

export default defineEventHandler(async (event) => {
  const { user: userSess } = await requireUserSession(event);
  if (userSess.emailVerifiedAt) {
    throw createError({
      statusMessage: "Your email is already verified",
      statusCode: 400,
    });
  }
  const user = await db
    .select({
      email_verification_requested_at: users.email_verification_requested_at,
    })
    .from(users)
    .where(eq(users.id, userSess.id));

  // 5 minute cooldown, just to avoid email spam
  const lastVerifyReq = user[0]?.email_verification_requested_at;
  console.log(lastVerifyReq);
  if (lastVerifyReq) {
    const d = lastVerifyReq.getTime();
    const minutesAgo = Math.round((Date.now() - d) / msPrMinute);
    console.log(
      "last verify-request was sent",
      Math.round(minutesAgo),
      "minutes ago",
    );
    if (minutesAgo < 5) {
      throw createError({
        statusMessage:
          "You need to wait up to 5 minutes before you can send another email",
        statusCode: 403,
      });
    }
  }

  console.info("sending email verification email to", userSess.email, "..");
  await sendVerifyEmailEmail(userSess.id, userSess.fullName, userSess.email);
  console.info("updating `email_verification_requested_at` on user..");
  await db
    .update(users)
    .set({ email_verification_requested_at: new Date() })
    .where(eq(users.id, userSess.id));
  console.info("send-verify-email endpoint finish");
  return { ok: true };
});
