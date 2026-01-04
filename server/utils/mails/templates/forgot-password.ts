import { generateMail, escapeHTML } from "../template";

export const forgotPasswordEmailTemplate = (
  username: string,
  forgotPasswordLink: string,
): string => {
  const content = `
    <p>Hej ${escapeHTML(username)}, og velkommen!</p>
    <p>Tryk på dette link for at vælge et nyt password til din Soc-Inno konto.</p>
    <p>Hvis du ikke har anmodet om et nyt password, bedes du kontakte administratorerne af Soc-inno.</p>
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
    undefined,
  );
  return fullHtml;
};
