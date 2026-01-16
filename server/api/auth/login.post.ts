import { users } from "~~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

// TODO: remove autoimported imports when it works in editor...
import { db } from "../../utils/db";
import { waitABit } from "../../utils/waitABit";
import { refreshUserSession } from "../../utils/session";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const beginTime = new Date().getTime();

  const user = await db
    .select({
      email: users.email,
      password: users.password,
      id: users.id,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.removedAt)));

  if (!user[0]) {
    console.log("User does not exist");
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      message: "Wrong email or password",
    });
  }

  const correctPassword = await verifyPassword(user[0].password, password);
  if (!correctPassword) {
    console.log("Password is wrong");
    await waitABit(beginTime);
    throw createError({
      statusCode: 401,
      message: "Wrong email or password",
    });
  }

  await refreshUserSession(event, user[0].id);
  console.log("logged in and refreshed server session!");

  // always wait at least 2 sec before responding
  await waitABit(beginTime);

  return { success: true };
});
