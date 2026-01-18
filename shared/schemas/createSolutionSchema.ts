import * as z from "zod";

export const SolutionTitleMinLength = 5;
export const SolutionTitleMaxLength = 50;
export const SolutionTextAreaMaxLength = 6000; // 3,7 - 4,8 pages (https://charactercounter.com/characters-to-words)

export const createSolutionFieldsSchema = z.strictObject({
  title: z
    .string()
    .min(
      SolutionTitleMinLength,
      `Titlen skal være minimum ${SolutionTitleMinLength} karakterer`,
    )
    .max(
      SolutionTitleMaxLength,
      `Titlen kan være maksimum ${SolutionTitleMaxLength} karakterer`,
    ),
  solutionCategories: z
    .array(z.string().min(2).max(50))
    .min(1, "Du skal vælge/indtaste minimum 1 nøgleord til løsningen"),
  solutionDescription: z
    .string()
    .min(2, "Du skal indtaste en beskrivelse af løsningen")
    .max(
      SolutionTextAreaMaxLength,
      `Du kan maks indtaste ${SolutionTextAreaMaxLength} karakterer`,
    ),
  isTested: z.boolean(),
  testingText: z
    .string()
    .min(2, "Du skal indtaste tekst om testning af løsningen")
    .max(
      SolutionTextAreaMaxLength,
      `Du kan maks indtaste ${SolutionTextAreaMaxLength} karakterer`,
    ),
  primaryPdfPublic: z.boolean(),
  freeText: z
    .string()
    .max(
      SolutionTextAreaMaxLength,
      `Du kan maks indtaste ${SolutionTextAreaMaxLength} karakterer`,
    )
    .optional()
    .default(""),
});

export const createSolutionFilesSchema = z.strictObject({
  illustrations: z
    .array(z.file())
    .max(10, "Du kan vedhæfte maksimum 10 illustrationer"),
  attachments: z.array(z.file()).max(10, "Du kan vedhæfte maksimum 10 filer"),
  primaryPdf: z.file("En løsning skal indeholde en hovedrapport"),
});

export const createSolutionSchema = z.strictObject({
  ...createSolutionFieldsSchema.shape,
  ...createSolutionFilesSchema.shape,
});

export type CreateSolutionSchema = z.output<typeof createSolutionSchema>;
