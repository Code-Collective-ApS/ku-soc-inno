import { desc, eq, sql, inArray } from "drizzle-orm";
import type { OrganizationSector } from "~~/shared/utils/organization_sector";
import type { OrganizationType } from "~~/shared/utils/organization_type";
import { cases } from "~~/server/db/schema";
import { db } from "../db";
import {
  type SwapDatesWithStrings,
  serializeManyDates,
  serializeDates,
} from "../datetime";

const caseResponseColumns = {
  id: true,
  challengeDescription: true,
  contactName: true,
  contactEmail: true,
  contactOrganization: true,
  contactPublic: true,
  contactTitle: true,
  importanceDescription: true,
  title: true,
  freeText: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  organizationType: true,
  sector: true,
  dataText: true,
};
const caseResponseWith = {
  barriers: {
    columns: {
      id: true,
      barrier: true,
    },
  },
  categoryTags: {
    columns: {
      id: true,
      tag: true,
    },
  },
  solutions: {
    with: {
      solutionCategories: {
        columns: {
          id: true,
          updatedAt: true,
          solutionCategory: true,
        },
      },
    },
    columns: {
      id: true,
      solutionDescription: true,
      updatedAt: true,
    },
  },
};

// TODO: hardcoding only purpose is to improve types (fix in some other way)
const _selectCases = db.query.cases.findMany({
  columns: {
    id: true,
    challengeDescription: true,
    contactName: true,
    contactEmail: true,
    contactOrganization: true,
    contactPublic: true,
    contactTitle: true,
    importanceDescription: true,
    title: true,
    freeText: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    organizationType: true,
    sector: true,
    dataText: true,
  } satisfies typeof caseResponseColumns,
  with: caseResponseWith,
});

type CaseResponseColumns = Awaited<ReturnType<typeof _selectCases.execute>>;

export const selectNewestCases = db.query.cases
  .findMany({
    columns: caseResponseColumns,
    limit: sql.placeholder("limit"),
    offset: sql.placeholder("offset"),
    with: caseResponseWith,
    orderBy: desc(cases.createdAt),
  })
  .prepare("select_cases");

export const selectCaseById = db.query.cases
  .findFirst({
    where: eq(cases.id, sql.placeholder("id")),
    columns: caseResponseColumns,
    with: caseResponseWith,
  })
  .prepare("select_case_by_id");

export const selectCasesByIds = (ids: number[]) => db.query.cases.findMany({
    where: inArray(cases.id, ids),
    columns: caseResponseColumns,
    with: caseResponseWith,
  })
  .prepare("select_cases_by_id");

export type CaseResponse = (Awaited<
  ReturnType<typeof selectNewestCases.execute>
> &
  CaseResponseColumns)[number];

export type CaseSerialized = SwapDatesWithStrings<CaseResponse> & {
  organizationType: OrganizationType;
  sector: OrganizationSector;
  solutions: {
    id: number;
    updatedAt: string;
    solutionCategories: {
      id: number;
      solutionCategory: string;
    }[];
    solutionDescription: string;
  }[];
};

// typescript makes me crazy sometimes
export function serializeCase(_case: CaseResponse): CaseSerialized {
  return {
    ...serializeDates(_case),
    solutions: serializeManyDates(
      _case.solutions as {
        id: number;
        updatedAt: string;
        solutionCategories: {
          id: number;
          solutionCategory: string;
        }[];
        solutionDescription: string;
      }[],
    ),
    organizationType: _case.organizationType as OrganizationType,
    sector: _case.sector as OrganizationSector,
  };
}

export function serializeCases(_cases: CaseResponse[]): CaseSerialized[] {
  return _cases.map(serializeCase);
}

export function stripCaseForContactInfo(_case: CaseResponse): CaseResponse {
  _case.contactName = "";
  _case.contactEmail = "";
  _case.contactOrganization = "";
  _case.contactTitle = "";
  return _case;
}

export function requireCaseEditingPermissions(
  caseRes: CaseResponse,
  userId: number,
) {
  if (caseRes.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Du har ikke adgang til at redigere i denne case",
    });
  }
}
