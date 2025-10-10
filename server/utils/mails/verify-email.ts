import { generateMail } from "../mail_layout";

export const verifyEmailTemplate = (
  name: string,
  verifyLink: string,
): string => {
  const content = `
    <p>Hello ${name}, and welcome to Soc-inno!</p>
    <p>Please verify your email to finish setting up your new account.</p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
      <tbody>
        <tr>
          <td align="left">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td><a href="${verifyLink}" target="_blank">Verify email</a></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <p>Good luck!</p>
    <p>If not, please reach out to the maintainers on nfb@codecollective.dk</p>
  `;
  const previewText = `Welcome to Soc-inno! Please verify your email`;
  const fullHtml = generateMail(
    "Please verify your email",
    content,
    previewText,
  );
  return fullHtml;
};
