import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { users } from "~~/server/db/schema";
// import { sendVerifyEmailEmail } from "~~/server/utils/email-verification";

const bodySchema = z.strictObject({
  password: z.string().min(6),
  email: z.email(),
  organization: z.string().min(2),
  title: z.string().min(2),
  fullName: z.string().min(2),
});

const debug = true;

export default defineEventHandler(async (event) => {
  const { email, password, fullName, organization, title } =
    await readValidatedBody(event, bodySchema.parse);
  if (debug) console.log("got valid create user request");
  const beginTime = new Date().getTime();

  if (debug) console.log("checking if user exists..");
  const existing = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(or(eq(users.email, email), eq(users.email, email)));

  if (existing[0]) {
    console.log("it did exist. returning 400");
    const msg = `An account with that email already exists`;
    await waitABit(beginTime);
    throw createError({
      statusCode: 400,
      statusMessage: msg,
    });
  }

  console.log("hashing password..");
  const hashedPassword = await hashPassword(password);

  console.log("creating new unverified user in db..");
  const result = await db
    .insert(users)
    .values({
      email: email,
      password: hashedPassword,
      organization,
      fullName,
      title,
    })
    .returning({ id: users.id });

  console.log("sending email to request user verification..");

  try {
    if (!result[0]?.id) {
      throw new Error("User was not inserted");
    }
    await sendVerifyEmailEmail(result[0]!.id, fullName, email);
  } catch (e) {
    // remove user if mail sending went bad
    // TODO: report error!
    console.error(e);
    if (result.length) {
      console.log(
        `removing user ${email} because initial required email sending failed..`,
      );
      await db.delete(users).where(eq(users.id, result[0]!.id));
      console.log("clearing user session..");
      clearUserSession(event);
      await waitABit(beginTime);
      throw createError({
        statusCode: 500,
        statusMessage:
          "We we were unable to send emails. The error is reported. Please come back another time",
      });
    }
  }

  console.log("create user success! returning user id");
  await waitABit(beginTime);
  return { id: result[0]!.id };
});
