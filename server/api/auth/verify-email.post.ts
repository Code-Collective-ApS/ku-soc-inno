import z from "zod";
import { setEmailVerified } from "~~/server/utils/resources/user";
import { parseJwt } from "~~/server/utils/signing";

const bodyDto = z.strictObject({
  jwt: z.string(),
});

export default defineEventHandler(async (event) => {
  const sess = await getUserSession(event);
  const user = sess.user;
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
      statusMessage:
        "Din konto er allerede verificeret " + user.emailVerifiedAt,
    });
  }

  const config = useRuntimeConfig();
  try {
    const body = await readValidatedBody(event, bodyDto.parse);
    const { error, payload } = parseJwt(config.verificationSecret, body.jwt);
    if (error) throw new Error(error);
    if (payload?.userId !== user.id) {
      throw new Error("Payload has no user id");
    }
    await setEmailVerified(user.id);
    console.info("successfully verified user", user.email);
    await refreshUserSession(event, user.id);

    return {
      isValid: true,
    };
  } catch (e) {
    console.error(e);
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid signature",
    });
  }
});
