import type { EventHandlerRequest, H3Event } from "h3";
import type { UserSession } from "#auth-utils";
import { users } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
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
    .where(and(eq(users.id, userId), isNull(users.removedAt)));

  if (!user[0]) {
    console.error("Session is valid but user does not exist");
    await clearUserSession(event);
    throw createError({
      statusCode: 401,
      message: "Session is valid but user does not exist",
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
  const sess = await setUserSession(event, newSess.user);
  return sess;
}
