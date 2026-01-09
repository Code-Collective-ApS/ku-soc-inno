import { generateMail, escapeHTML } from "../template";

export const forgotPasswordEmailTemplate = (
  name: string,
  email: string,
  forgotPasswordLink: string,
): string => {
  const content = `
    <p>Hej ${escapeHTML(name)}.</p>
    <p>Du har anmodet om at gendanne dit password på din Soc-Inno konto.</p>
    <p>Hvis du ikke har gjort dette, bedes du kontakte administratorerne af Soc-inno så hurtigt som muligt.</p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
      <tbody>
        <tr>
          <td align="left">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td><a href="${forgotPasswordLink}" target="_blank">Indtast nyt password</a></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `;
  const previewText = `Soc-Inno - Glemt password`;
  const fullHtml = generateMail(
    "Glemt password på Soc-Inno konto",
    content,
    previewText,
    email,
  );
  return fullHtml;
};
