import z from "zod";

export const changeEmailSchema = z.strictObject({
  email: z.email(),
});
