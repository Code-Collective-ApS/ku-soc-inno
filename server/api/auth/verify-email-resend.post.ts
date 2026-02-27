import { VerifyEmailTokenMinIntervalMs } from "~~/server/utils/tokens";
import { users } from "../../db/schema";
import { eq, isNull, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const beginTime = new Date().getTime();
  const { user: userSess } = await requireUserSession(event);
  if (userSess.emailVerifiedAt) {
    throw createError({
      message: "Din email er allerede verificeret",
      statusCode: 400,
    });
  }
  const userRes = await db
    .select({
      id: users.id,
      email_verification_requested_at: users.emailVerificationRequestedAt,
    })
    .from(users)
    .where(and(eq(users.id, userSess.id), isNull(users.removedAt)));

  if (!userRes[0]) {
    console.log("User does not exist");
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      message: "Wrong email or password",
    });
  }

  const user = userRes[0];

  // 5 minute cooldown, just to avoid email spam
  const lastVerifyReq = user.email_verification_requested_at;
  console.log(lastVerifyReq);
  if (lastVerifyReq) {
    const d = lastVerifyReq.getTime();
    const msAgo = Math.round(Date.now() - d);
    const minutesAgo = Math.round(msAgo / 60000);
    console.log("last verify-request was sent", minutesAgo, "minutes ago");
    if (msAgo < VerifyEmailTokenMinIntervalMs) {
      const minutesLeft = Math.floor(
        (VerifyEmailTokenMinIntervalMs - msAgo) / 60000,
      );
      throw createError({
        message: `You need to wait ${minutesLeft} minutes before you can send another email`,
        statusCode: 403,
      });
    }
  }

  // create verify email token
  const verifyEmailToken = await createVerifyEmailToken(user.id);

  console.info("sending verify-email email to", userSess.email, "..");
  try {
    await sendVerifyEmailEmail(
      config.publicHost,
      userSess.id,
      userSess.fullName,
      userSess.email,
      verifyEmailToken.token,
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
