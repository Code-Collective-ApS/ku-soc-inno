export type OrganizationType =
  | "MUNI"
  | "COMPANY"
  | "NGO"
  | "HOSPITAL"
  | "POLICE"
  | "MILITARY"
  | "SCHOOL"
  | "HIGHSCHOOL"
  | "MUSEUM"
  | "STATE"
  | "KINDER"
  | "UNIVERSITY";

export const ORGANIZATION_TYPES: Record<
  OrganizationType,
  { value: string; human: string }
> = {
  MUNI: {
    value: "MUNI",
    human: "Kommune",
  },
  COMPANY: {
    value: "COMPANY",
    human: "Virksomhed",
  },
  NGO: {
    value: "NGO",
    human: "NGO",
  },
  STATE: {
    value: "STATE",
    human: "Stat",
  },
  HOSPITAL: {
    value: "HOSPITAL",
    human: "Hospital",
  },
  POLICE: {
    value: "POLICE",
    human: "Politi",
  },
  MILITARY: {
    value: "MILITARY",
    human: "Militær",
  },
  MUSEUM: {
    value: "MUSEUM",
    human: "Museum",
  },
  UNIVERSITY: {
    value: "UNIVERSITY",
    human: "Universitet",
  },
  HIGHSCHOOL: {
    value: "HIGHSCHOOL",
    human: "Gymnasium",
  },
  SCHOOL: {
    value: "SCHOOL",
    human: "Skole",
  },
  KINDER: {
    value: "KINDER",
    human: "Børnehave/vuggestue",
  },
};

export const ORGANIZATION_TYPES_VALUES = Object.keys(
  ORGANIZATION_TYPES,
) as OrganizationType[];

export function getPrettyOrgType(s: OrganizationType) {
  return ORGANIZATION_TYPES[s]?.human || s;
}
