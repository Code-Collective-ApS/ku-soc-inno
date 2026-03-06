import { updateEmail, getUserByEmail } from "~~/server/utils/resources/user";
import { changeEmailSchema } from "~~/shared/schemas/changeEmailSchema";
import { captureException } from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, changeEmailSchema.parse);

  const beginTime = new Date().getTime();

  // ensure user actually changes to a new email
  if (user.email === body.email) {
    await waitABit(beginTime);
    const err = createError({
      statusCode: 400,
      message: "Du kan ikke skifte til en identisk email",
    });
    captureException(err);
    throw err;
  }

  // ensure no other user uses this email
  const userWithSameEmail = await getUserByEmail(body.email);
  if (userWithSameEmail) {
    await waitABit(beginTime);
    const err = createError({
      statusCode: 400,
      message: "Du kan ikke skifte til denne email, da den er i brug",
    });
    captureException(err);
    throw err;
  }

  // update email
  await updateEmail(user.id, body.email);

  // refresh session
  await refreshUserSession(event, user.id);

  // always wait at least 2 sec before responding
  await waitABit(beginTime);
  setResponseStatus(event, 204);
});
