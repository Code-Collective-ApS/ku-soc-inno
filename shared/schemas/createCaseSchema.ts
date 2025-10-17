import * as z from "zod";

export const createCaseSchema = z.strictObject({
  title: z.string().min(2, "Must be at least 2 characters"),
  challengeDescription: z.string().min(2, "Must be at least 2 characters"),
  importanceDescription: z.string().min(2, "Must be at least 2 characters"),
  freeText: z.string("free_text"),
  contactName: z.string().min(2, "Must be at least 2 characters"),
  contactOrganization: z.string().min(2, "Must be at least 2 characters"),
  contactTitle: z.string().min(2, "Must be at least 2 characters"),
  contactEmail: z.email("Must be a valid email"),
  contactPublic: z.boolean("Must be a valid boolean").default(false),
  categories: z.array(z.string()).min(1, "You must choose at least 1 category"),
});

export type CreateCaseSchema = z.output<typeof createCaseSchema>;
