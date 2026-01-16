import { updateEmail, getUserByEmail } from "~~/server/utils/resources/user";
import { changeEmailSchema } from "~~/shared/schemas/changeEmailSchema";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, changeEmailSchema.parse);

  const beginTime = new Date().getTime();

  // ensure user actually changes to a new email
  if (user.email === body.email) {
    // TODO: report error
    await waitABit(beginTime);
    throw createError({
      statusCode: 400,
      message: "Du kan ikke skifte til en identisk email",
    });
  }

  // ensure no other user uses this email
  const userWithSameEmail = await getUserByEmail(body.email);
  if (userWithSameEmail) {
    // TODO: report error
    await waitABit(beginTime);
    throw createError({
      statusCode: 400,
      message: "Du kan ikke skifte til denne email, da den er i brug",
    });
  }

  // update email
  await updateEmail(user.id, body.email);

  // refresh session
  await refreshUserSession(event, user.id);

  // always wait at least 2 sec before responding
  await waitABit(beginTime);
  setResponseStatus(event, 204);
});
