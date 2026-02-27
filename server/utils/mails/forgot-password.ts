import { generateResetPasswordUrl } from "../tokens";

export async function sendForgotPasswordEmail(
  baseUrl: string,
  userId: number,
  name: string,
  email: string,
  resetPasswordToken: string,
) {
  if (!email) throw "Email is missing";
  if (!name) throw "Name is missing";
  if (!userId) throw "User id is missing";

  const link = generateResetPasswordUrl(baseUrl, email, resetPasswordToken);
  await sendMail(
    email,
    "Glemt password",
    forgotPasswordEmailTemplate(name, email, link),
    true,
  );
}
