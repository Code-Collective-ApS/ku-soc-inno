import * as z from "zod";

export const createSolutionFieldsSchema = z.strictObject({
  solutionCategory: z
    .string()
    .min(2, "Du skal vælge en kategori til løsningen"),
  solutionDescription: z
    .string()
    .min(2, "Du skal indtaste en beskrivelse af løsningen"),
  isTested: z.boolean(),
  testingText: z
    .string()
    .min(2, "Du skal indtaste tekst om testning af løsningen"),
  primaryPdfPublic: z.boolean(),
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
