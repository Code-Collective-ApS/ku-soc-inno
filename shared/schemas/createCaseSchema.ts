import * as z from "zod";
import { ORGANIZATION_SECTORS_VALUES } from "#imports";
export const CaseTextAreaMaxLength = 6000; // 3,7 - 4,8 pages (https://charactercounter.com/characters-to-words)

// TODO: sync max lengths with varchar size in schema
export const createCaseSchema = z.strictObject({
  title: z.string().min(2, "Skal være minimum 2 karakterer").max(300),
  challengeDescription: z
    .string()
    .min(2, "Skal være minimum 2 karakterer")
    .max(
      CaseTextAreaMaxLength,
      `Du kan maks indtaste ${CaseTextAreaMaxLength} karakterer`,
    ),
  importanceDescription: z
    .string()
    .min(2, "Skal være minimum 2 karakterer")
    .max(
      CaseTextAreaMaxLength,
      `Du kan maks indtaste ${CaseTextAreaMaxLength} karakterer`,
    ),
  freeText: z
    .string("free_text")
    .max(
      CaseTextAreaMaxLength,
      `Du kan maks indtaste ${CaseTextAreaMaxLength} karakterer`,
    ),
  contactName: z.string().min(2, "Skal være minimum 2 karakterer").max(300),
  contactOrganization: z
    .string()
    .min(2, "Skal være minimum 2 karakterer")
    .max(300),
  contactTitle: z.string().min(2, "Skal være minimum 2 karakterer").max(300),
  contactEmail: z.email("Emailen er ugyldig").max(300),
  contactPublic: z.boolean("Skal være true eller false").default(false),
  categories: z
    .array(z.string().min(2).max(50))
    .min(1, "Du skal tilføje minimum 1 kategori."),
  barriers: z
    .array(z.string().min(1).max(300))
    .min(1, "Du skal tilføje minimum 1 løsningsbarriere")
    .max(300),
  organizationType: z
    .string()
    .min(2, "Du mangler at tilføje en organisationstype")
    .max(300),
  organizationSector: z.enum(
    ORGANIZATION_SECTORS_VALUES,
    "Det er en ugyldig sektor",
  ),
  dataText: z
    .string()
    .min(2, "Du skal indtaste en beskrivelse af dataindsamlingen")
    .max(
      CaseTextAreaMaxLength,
      `Du kan maks indtaste ${CaseTextAreaMaxLength} karakterer`,
    ),
});

export type CreateCaseSchema = z.output<typeof createCaseSchema>;
