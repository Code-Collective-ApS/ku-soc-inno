import z from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { users } from "~~/server/db/schema";
import { isError } from "h3";
import {
  requireTokenByToken,
  useToken,
  verifyToken,
} from "~~/server/utils/tokens";

const bodyDto = z.strictObject({
  reset_password_token: z.string().min(6),
  new_password: z.string().min(6),
});

export default defineEventHandler(async (event) => {
  const beginTime = new Date().getTime();
  const body = await readValidatedBody(event, bodyDto.parse);

  // verify the password
  const passwordTooWeak = validatePassword(body.new_password);
  if (passwordTooWeak) {
    throw createError({ statusCode: 400, message: passwordTooWeak });
  }

  const resetPasswordToken = await requireTokenByToken(
    body.reset_password_token,
  );

  // verify the token
  try {
    await verifyToken(resetPasswordToken, "reset_password");
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

  // verify the user
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      email: true,
    },
    where: and(
      eq(users.id, resetPasswordToken.userId),
      isNull(users.removedAt),
    ),
  });
  if (!user) {
    // TODO: report error
    throw createError({
      statusCode: 400,
      statusMessage: "User does not exist",
    });
  }

  // update the password
  const hashedPassword = await hashPassword(body.new_password);
  console.log("updating password for user", user.id, user.email);
  await updatePassword(user.id, hashedPassword);

  // use the token
  await useToken(resetPasswordToken.token);

  // respond ok
  await waitABit(beginTime);
  setResponseStatus(event, 204);
});
