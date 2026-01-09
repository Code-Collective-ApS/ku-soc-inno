export function isValidEmail(inp: string) {
  if (!inp) return false;
  inp = inp.toLowerCase().trim();
  if (!inp.includes("@")) return false;
  if (inp.indexOf("@") !== inp.lastIndexOf("@")) return false; // multiple @
  if (inp.includes(" ")) return false;
  const letterNumber = /[a-z0-9]/;
  const letter = /[a-z0-9]/;
  const firstLetter = inp[0] as string;
  const lastLetter = inp[inp.length - 1] as string;
  if (!letterNumber.test(firstLetter)) return false;
  if (!letter.test(lastLetter)) return false;
  const indexOfAt = inp.indexOf("@");
  const afterAt = inp.slice(indexOfAt + 1);
  if (!afterAt) return false;
  if (!afterAt.includes(".")) return false;
  if (!letterNumber.test(afterAt[0] as string)) return false;
  return true;
}
