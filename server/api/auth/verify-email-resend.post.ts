import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
const msPrMinute = 1000 * 60;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { user: userSess } = await requireUserSession(event);
  if (userSess.emailVerifiedAt) {
    throw createError({
      message: "Din email er allerede verificeret",
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
        message:
          "You need to wait up to 5 minutes before you can send another email",
        statusCode: 403,
      });
    }
  }

  console.info("sending verify-email email to", userSess.email, "..");
  try {
    await sendVerifyEmailEmail(
      config.publicHost,
      config.verifyEmailSecret,
      userSess.id,
      userSess.fullName,
      userSess.email,
    );
  } catch (err: unknown) {
    console.error(err);
    // TODO: report error!
    throw createError({
      statusCode: 500,
      message:
        "Det lykkes os ikke at sende emailen. Fejlen er rapporteret og vi kigger på sagen snarest.",
    });
  }
  console.info("done sending verify-email email to", userSess.email, "..");

  // update forgot password request date in db
  await setVerifyEmailRequested(userSess.id);
  return { ok: true };
});
