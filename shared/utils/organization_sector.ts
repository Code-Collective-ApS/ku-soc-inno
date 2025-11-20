export type OrganizationSector =
  | "PUBLIC"
  | "PRIVATE"
  | "VOLUNTEER"
  | "MULTI_PARTNERSHIP";

export const ORGANIZATION_SECTORS: Record<
  OrganizationSector,
  { value: string; human: string }
> = {
  PUBLIC: {
    value: "PUBLIC",
    human: "Offentlig",
  },
  PRIVATE: {
    value: "PRIVATE",
    human: "Privat",
  },
  VOLUNTEER: {
    value: "VOLUNTEER",
    human: "Frivillig",
  },
  MULTI_PARTNERSHIP: {
    value: "MULTI_PARTNERSHIP",
    human: "Tværsektorielt/partnerskab",
  },
};

export const ORGANIZATION_SECTORS_VALUES = Object.keys(
  ORGANIZATION_SECTORS,
) as OrganizationSector[];
