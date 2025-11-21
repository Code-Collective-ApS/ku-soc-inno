// returns string with error msg
export type PasswordValidationRule =
  | "upper"
  | "upper_digit"
  | "upper_digit_symbol";

const ruleMap: Record<PasswordValidationRule, RegExp> = {
  upper_digit_symbol: new RegExp(`^([^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$`),
  upper_digit: new RegExp(`^([^0-9]*|[^A-Z]*|[^a-z]*)$`),
  upper: new RegExp(`^([^0-9]*|[^a-z]*)$`),
};

const ruleErrors: Record<PasswordValidationRule, string> = {
  upper_digit_symbol:
    "Adgangskoden skal indeholde mindst 1 symbol, 1 tal, 1 stort bogstav og 1 lille bogstav",
  upper:
    "Adgangskoden skal indeholde mindst 1 stort bogstav og 1 lille bogstav",
  upper_digit:
    "Adgangskoden skal indeholde mindst 1 tal, 1 stort bogstav og 1 lille bogstav",
};

/**
 * Returns undefined if the password is strong enough, and returns a validation error message if not
 */
export function isStrongEnough(
  pw: string,
  minLen: number,
  rule: PasswordValidationRule = "upper_digit_symbol",
): string | undefined {
  const regex = ruleMap[rule];
  const errMsg = ruleErrors[rule];
  console.log(errMsg);

  if (pw.length < minLen)
    return `Passwordet skal være minimum ${minLen} karakterer langt`;

  if (regex.test(pw)) {
    console.log("isStrongEnough returning error message:", errMsg);
    return errMsg;
  } else {
    console.log("isStrongEnough password validation success", { regex, pw });
  }
}
