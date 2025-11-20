import * as z from "zod";
import {
  ORGANIZATION_SECTORS_VALUES,
  ORGANIZATION_TYPES_VALUES,
} from "#imports";

// TODO: sync max lengths with varchar size in schema
export const createCaseSchema = z.strictObject({
  title: z.string().min(2, "Skal være minimum 2 karakterer").max(300),
  challengeDescription: z
    .string()
    .min(2, "Skal være minimum 2 karakterer")
    .max(4000),
  importanceDescription: z
    .string()
    .min(2, "Skal være minimum 2 karakterer")
    .max(4000),
  freeText: z.string("free_text"),
  contactName: z.string().min(2, "Skal være minimum 2 karakterer").max(300),
  contactOrganization: z
    .string()
    .min(2, "Skal være minimum 2 karakterer")
    .max(300),
  contactTitle: z.string().min(2, "Skal være minimum 2 karakterer").max(300),
  contactEmail: z.email("Emailen er ugyldig").max(300),
  contactPublic: z.boolean("Skal være true eller false").default(false),
  categories: z.array(z.string()).min(1, "Du skal tilføje minimum 1 kategori."),
  barriers: z
    .array(z.string().min(1).max(300))
    .min(1, "Du skal tilføje minimum 1 løsningsbarriere")
    .max(300),
  // organizationType: z.string().min(2, "Mangler").max(300),
  organizationType: z.enum(
    ORGANIZATION_TYPES_VALUES,
    "Det er en ugyldig organisationstype",
  ),
  organizationSector: z.enum(
    ORGANIZATION_SECTORS_VALUES,
    "Det er en ugyldig sektor",
  ),
  dataText: z
    .string()
    .min(2, "Du skal indtaste en beskrivelse af dataindsamlingen"),
});

export type CreateCaseSchema = z.output<typeof createCaseSchema>;
