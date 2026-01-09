import { generateJwt } from "./signing";

const msPrMinute = 1000 * 60;

export const ForgotPasswordValidityMinutes = 5;
export const ForgotPasswordValidityMs =
  ForgotPasswordValidityMinutes * 60 * 1000;

export function generateForgotPasswordLink(
  baseUrl: string,
  secret: string,
  userId: number,
  email: string,
  validInMinutes: number,
) {
  const expireDate = new Date(Date.now() + msPrMinute * validInMinutes);
  const jwt = generateJwt(
    secret,
    { userId, email, type: "forgot-password" },
    expireDate,
  );

  const link = `${baseUrl}/reset-password?email=${toBase64Url(email)}&jwt=${jwt}`;
  console.log(`forgot password link valid in ${validInMinutes} min:`, link);
  return link;
}

export async function sendForgotPasswordEmail(
  baseUrl: string,
  secret: string,
  userId: number,
  name: string,
  email: string,
) {
  if (!email) throw "Email is missing";
  if (!name) throw "Name is missing";
  if (!userId) throw "User id is missing";

  const link = generateForgotPasswordLink(
    baseUrl,
    secret,
    userId,
    email,
    ForgotPasswordValidityMinutes,
  );
  await sendMail(
    email,
    "Glemt password",
    forgotPasswordEmailTemplate(name, email, link),
    true,
  );
}
