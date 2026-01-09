import { users } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ForgotPasswordValidityMs } from "~~/server/utils/forgot-password";

const bodySchema = z.object({
  email: z.email(),
});

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, bodySchema.parse);

  const beginTime = new Date().getTime();
  const config = useRuntimeConfig();

  // fetch user with the email provided
  const userRes = await db
    .select({
      name: users.fullName,
      email: users.email,
      password: users.password,
      id: users.id,
      emailVerifiedAt: users.emailVerifiedAt,
      forgotPasswordAt: users.forgot_password_requested_at,
    })
    .from(users)
    .where(eq(users.email, email));

  // ensure user exists
  if (!userRes[0]) {
    console.log("User does not exist");
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      message: "Wrong email or password",
    });
  }

  const user = userRes[0]!;

  // ensure user does not spam us
  if (user.forgotPasswordAt) {
    console.log("user forgot password is set to", user.forgotPasswordAt);
    const minTime = user.forgotPasswordAt.getTime() + ForgotPasswordValidityMs;
    if (Date.now() < minTime) {
      await waitABit(beginTime);

      const minutesLeft = Math.round((minTime - Date.now()) / 1000 / 60);
      throw createError({
        statusCode: 400,
        message: `Du kan først sende en ny glemt-password mail om ${minutesLeft} minutter`,
      });
    }
  }

  // send email
  try {
    console.info("sending forgot password email to", user.email, "..");
    await sendForgotPasswordEmail(
      config.publicHost,
      config.forgotPasswordSecret,
      user.id,
      user.name,
      user.email,
    );
  } catch (err: unknown) {
    console.error(err);
    // TODO: report error!
    await waitABit(beginTime);
    throw createError({
      statusCode: 500,
      message:
        "Det lykkes os ikke at sende emailen. Fejlen er rapporteret og vi kigger på sagen snarest.",
    });
  }

  // update forgot password request date in db
  await setForgotPasswordRequested(user.id);

  // make sure there is at least some response time (to avoid timing attacks)
  await waitABit(beginTime);

  setResponseStatus(event, 204);
});
