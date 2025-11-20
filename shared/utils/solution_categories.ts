export type SolutionCategory =
  | "PRODUCT"
  | "PROCESS"
  | "SERVICE"
  | "BUSINESSMODEL"
  | "CAMPAIGN_RETORICAL";

export const SOLUTION_CATEGORIES: Record<
  SolutionCategory,
  { value: string; human: string }
> = {
  PRODUCT: {
    value: "PRODUCT",
    human: "Produkt",
  },
  PROCESS: {
    value: "PROCESS",
    human: "Proces",
  },
  SERVICE: {
    value: "SERVICE",
    human: "Service",
  },
  BUSINESSMODEL: {
    value: "BUSINESSMODEL",
    human: "Forretningsmodel",
  },
  CAMPAIGN_RETORICAL: {
    value: "CAMPAIGN_RETORICAL",
    human: "Kampagne (retorisk)",
  },
};

export const SOLUTION_CATEGORIES_VALUES = Object.keys(
  SOLUTION_CATEGORIES,
) as SolutionCategory[];
