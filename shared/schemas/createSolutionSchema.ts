import { SOLUTION_CATEGORIES_VALUES } from "#imports";
import * as z from "zod";

export const createSolutionFieldsSchema = z.strictObject({
  solutionCategories: z
    .array(z.enum(SOLUTION_CATEGORIES_VALUES))
    .min(1, "Du skal vælge/indtaste minimum 1 løsningskategori"),
  solutionDescription: z
    .string()
    .min(2, "Du skal indtaste en beskrivelse af løsningen"),
  isTested: z.boolean(),
  testingText: z
    .string()
    .min(2, "Du skal indtaste tekst om testning af løsningen"),
  primaryPdfPublic: z.boolean(),
  dataText: z
    .string()
    .min(2, "Du skal indtaste en beskrivelse af dataindsamlingen"),
  freeText: z.string().optional().default(""),
});

export const createSolutionFilesSchema = z.strictObject({
  illustrations: z
    .array(z.file())
    .min(1, "Du skal minimum vælge 1 illustration")
    .max(10, "Du kan vedhæfte maksimum 10 illustrationer"),
  attachments: z
    .array(z.file())
    .min(1, "Du skal minimum vælge 1 vedhæftet fil")
    .max(10, "Du kan vedhæfte maksimum 10 filer"),
  primaryPdf: z.file("En løsning skal indeholde en hovedopgave"),
});

export const createSolutionSchema = z.strictObject({
  ...createSolutionFieldsSchema.shape,
  ...createSolutionFilesSchema.shape,
});

export type CreateSolutionSchema = z.output<typeof createSolutionSchema>;
