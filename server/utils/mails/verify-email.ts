import { generateResetEmailUrl } from "../tokens";
import { verifyEmailTemplate } from "./templates/verify-email";

export async function sendVerifyEmailEmail(
  baseUrl: string,
  userId: number,
  name: string,
  email: string,
  resetEmailToken: string,
) {
  if (!email) throw "Email is missing";
  if (!name) throw "Name is missing";
  if (!userId) throw "User id is missing";

  const url = generateResetEmailUrl(baseUrl, email, resetEmailToken);
  await sendMail(
    email,
    "Velkommen til Soc-Inno! Færdiggør opsætning af din nye konto",
    verifyEmailTemplate(name, url),
    true,
  );
}
