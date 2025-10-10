import { eq } from "drizzle-orm";
import z from "zod";
import { users } from "~~/server/db/schema";

const bodyDto = z.strictObject({
  sig: z.string().length(64),
});

export default defineEventHandler(async (event) => {
  const sess = await getUserSession(event);
  const user = sess.user;
  console.log("verify-email got user sess:", user);
  if (!user) {
    throw createError({
      status: 401,
      statusMessage:
        "You need to be logged in, to be able to verify your email",
    });
  }

  if (user.emailVerifiedAt) {
    throw createError({
      statusCode: 204,
      statusMessage: "Your account is already verified " + user.emailVerifiedAt,
    });
  }

  const config = useRuntimeConfig();
  try {
    const body = await readValidatedBody(event, bodyDto.parse);
    const targetSig = body.sig;
    // TODO: make email a hash instead
    const testSig = generateSignature(
      config.verificationSecret,
      user.id,
      user.email,
    );

    const isValid = targetSig === testSig;

    console.log({ targetSig, testSig, isValid });
    if (isValid) {
      await db
        .update(users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(users.id, user.id));
      console.log("successfully verified user", user.email);
      await refreshUserSession(event, user.id);
    } else {
      // TODO: show pretty error page with contact information and ability to request a new email mby
      console.error("Email validation signature was invalid");
    }

    return {
      targetSig,
      isValid,
    };
  } catch (e) {
    console.error(e);
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid signature",
    });
  }
});
