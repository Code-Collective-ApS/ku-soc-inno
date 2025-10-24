import * as z from "zod";

export const createSolutionSchema = z.strictObject({
  solutionCategory: z.string().min(2, "Must be at least 2 characters"),
  solutionDescription: z.string().min(2, "Must be at least 2 characters"),
  isTested: z.boolean(),
  testingText: z.string().min(2, "Must be at least 2 characters"),
  primaryPdfUrl: z.string().min(2, "Must be at least 2 characters"),
  primaryPdfPublic: z.boolean(),
  freeText: z.string().optional().default(""),
});

export type CreateSolutionSchema = z.output<typeof createSolutionSchema>;
