import z from "zod";
import { setEmailVerified } from "~~/server/utils/resources/user";

const bodyDto = z.strictObject({
  verify_email_token: z.string(),
});

export default defineEventHandler(async (event) => {
  const beginTime = new Date().getTime();
  const sess = await getUserSession(event);
  const user = sess.user;
  if (!user) {
    throw createError({
      status: 401,
      message: "You need to be logged in, to be able to verify your email",
    });
  }

  if (user.emailVerifiedAt) {
    throw createError({
      statusCode: 204,
      message: "Din konto er allerede verificeret " + user.emailVerifiedAt,
    });
  }

  // retrieve user provided token
  const body = await readValidatedBody(event, bodyDto.parse);

  // retrieve the identical token from db
  const verifyEmailToken = await requireTokenByToken(body.verify_email_token);

  // verify the token
  try {
    await verifyToken(verifyEmailToken, "verify_email");
  } catch (e) {
    // if verify token throws h3 errors, forward them to the client
    if (isError(e)) {
      await waitABit(beginTime);
      throw e;
      // if not, something is probably not as it should.
      // report and log the event but hide the error from the client
    } else {
      console.error(e);
      // TODO: report error
      await waitABit(beginTime);
      throw createError({
        statusCode: 400,
        statusMessage:
          "Linket er ugyldigt. Hvis du tror der er sket en fejl, bedes du kontakte administratorerne.",
      });
    }
  }

  // set email verified to true
  await setEmailVerified(user.id);
  console.info("successfully verified user", user.email);

  // refresh session
  await refreshUserSession(event, user.id);

  // use the token
  await useToken(verifyEmailToken.token);

  // respond ok
  await waitABit(beginTime);
  setResponseStatus(event, 200);
  return {
    isValid: true,
  };
});
