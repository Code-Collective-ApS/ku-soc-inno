import { z } from "zod";
import {
  getUserPassword,
  updatePassword,
} from "~~/server/utils/resources/user";
import { validatePassword } from "~~/shared/utils/password_validation";

const bodySchema = z.object({
  old: z.string().min(2),
  new: z.string().min(2),
  repeat: z.string().min(2),
});

export default defineEventHandler(async (event) => {
  const { user: _user } = await requireUserSession(event);
  const passwords = await readValidatedBody(event, bodySchema.parse);

  const beginTime = new Date().getTime();

  // retrieve the user's password
  const user = await getUserPassword(_user.id);

  // mostly for typescript sake. We know the user id is in db because it is in session
  if (!user[0]) {
    // TODO: report error
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      message: "Din konto eksisterer ikke længere",
    });
  }

  // check if old password is correct
  const correctPassword = await verifyPassword(
    user[0].password,
    passwords["old"],
  );
  if (!correctPassword) {
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      message: "The old password was wrong",
    });
  }

  // validate password
  const newPasswordError = validatePassword(passwords["new"]);
  if (newPasswordError) {
    throw createError({
      statusCode: 400,
      message: newPasswordError,
    });
  }

  // generate hash
  const hashedPassword = await hashPassword(passwords["new"]);
  await updatePassword(_user.id, hashedPassword);

  // always wait at least 2 sec before responding
  await waitABit(beginTime);
  setResponseStatus(event, 204);
});
