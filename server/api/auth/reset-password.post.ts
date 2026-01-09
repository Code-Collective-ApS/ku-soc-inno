import z from "zod";
import { eq, and } from "drizzle-orm";
import { users } from "~~/server/db/schema";
import { parseJwt } from "~~/server/utils/signing";

const bodyDto = z.strictObject({
  jwt: z.string().min(6),
  new_password: z.string().min(6),
});

// add wait a bit
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const beginTime = new Date().getTime();
  const body = await readValidatedBody(event, bodyDto.parse);

  const passwordTooWeak = validatePassword(body.new_password);
  if (passwordTooWeak) {
    throw createError({ statusCode: 400, message: passwordTooWeak });
  }

  try {
    const { error, payload } = parseJwt(config.forgotPasswordSecret, body.jwt);
    if (error) throw new Error(error);
    const email = payload?.email;
    const userId = payload?.userId;
    const type = payload?.type;
    if (type !== "forgot-password")
      throw new Error("Invalid payload type in forgot password JWT");
    if (!email) throw new Error("Email is missing from JWT");
    if (!userId) throw new Error("User id is missing from JWT");
    if (typeof email !== "string") throw new Error("Email is not a string");
    if (typeof userId !== "number") throw new Error("User id is not a number");
    console.log("got payload", payload);

    const user = await db
      .select({
        email: users.email,
        id: users.email,
      })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.email, email)));

    if (!user) {
      throw new Error("User does not exist");
    }

    const hashedPassword = await hashPassword(body.new_password);
    console.log("updating password for user", userId, email);
    await updatePassword(userId, hashedPassword);

    // make sure there is at least some response time (to avoid timing attacks)
    await waitABit(beginTime);
    setResponseStatus(event, 204);
  } catch (e) {
    console.error(e);
    // TODO: report error
    // make sure there is at least some response time (to avoid timing attacks)
    await waitABit(beginTime);
    throw createError({
      statusCode: 400,
      message: "Invalid signature",
    });
  }
});
