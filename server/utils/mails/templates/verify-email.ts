import { generateMail, escapeHTML } from "../template";

export const verifyEmailTemplate = (
  username: string,
  verifyLink: string,
): string => {
  const content = `
    <p>Hej ${escapeHTML(username)}, og velkommen!</p>
    <p>Tryk på dette link for at verificere din email og færdiggøre opsætningen af din Soc-Inno konto.</p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
      <tbody>
        <tr>
          <td align="left">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td><a href="${verifyLink}" target="_blank">Verificér email</a></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `;
  const previewText = `Velkommen til Soc-inno! Verificér din email`;
  const fullHtml = generateMail(
    "Færdiggør opsætning af Soc-Inno konto",
    content,
    previewText,
    undefined,
  );
  return fullHtml;
};
