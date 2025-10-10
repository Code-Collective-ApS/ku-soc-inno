import type { EventHandlerRequest, H3Event } from "h3";
import type { UserSession } from "#auth-utils";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export async function refreshUserSession(
  event: H3Event<EventHandlerRequest>,
  userId: number,
): Promise<UserSession> {
  const user = await db
    .select({
      email: users.email,
      password: users.password,
      fullName: users.fullName,
      organization: users.organization,
      title: users.title,
      id: users.id,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user[0]) {
    await clearUserSession(event);
    throw createError({
      statusCode: 401,
      statusMessage: "Session is valid but user does not exist",
    });
  }

  const newSess = {
    user: {
      id: user[0].id,
      email: user[0].email,
      fullName: user[0].fullName,
      organization: user[0].organization,
      title: user[0].title,
      emailVerifiedAt: user[0].emailVerifiedAt,
    },
  };
  console.log("Got user session:", newSess);
  await setUserSession(event, newSess);
  const sess = await requireUserSession(event);
  return sess;
}
