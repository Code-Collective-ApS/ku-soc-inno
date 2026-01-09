import { desc, eq, sql, inArray } from "drizzle-orm";
import type { OrganizationSector } from "~~/shared/utils/organization_sector";
import type { OrganizationType } from "~~/shared/utils/organization_type";
import { cases } from "~~/server/db/schema";
import { db, type Doc } from "../db";
import { type SwapDatesWithStrings, serializeDates } from "../datetime";
import type { PgPreparedQuery, PreparedQueryConfig } from "drizzle-orm/pg-core";
import { createError } from "h3";

const caseResponseColumns = {
  challengeDescription: true,
  contactEmail: true,
  contactName: true,
  contactOrganization: true,
  contactPublic: true,
  contactTitle: true,
  createdAt: true,
  dataText: true,
  freeText: true,
  id: true,
  importanceDescription: true,
  organizationType: true,
  sector: true,
  title: true,
  updatedAt: true,
  userId: true,
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

type CaseResponseSolutionCategoryColumns = Pick<
  Doc<"solutionCategories">,
  "id" | "solutionCategory"
>;

type CaseResponseSolutionColumns = Pick<
  Doc<"solutions"> & {
    solutionCategories: CaseResponseSolutionCategoryColumns[];
  },
  "id" | "updatedAt" | "solutionDescription" | "solutionCategories"
>;

type CaseResponseBarrierColumns = Pick<Doc<"barriers">, "barrier" | "id">;

type CaseResponseCategoryColumns = Pick<Doc<"categoryTags">, "tag" | "id">;

export type CaseResponse = Doc<"cases"> & {
  solutions: CaseResponseSolutionColumns[];
  categoryTags: CaseResponseCategoryColumns[];
  barriers: CaseResponseBarrierColumns[];
};

export type CaseSerialized = Omit<
  SwapDatesWithStrings<CaseResponse>,
  "userId"
> & {
  organizationType: OrganizationType;
  sector: OrganizationSector;
  solutions: SwapDatesWithStrings<CaseResponseSolutionColumns>[];
  isOwned: boolean;
};

export const selectNewestCases = db.query.cases
  .findMany({
    columns: caseResponseColumns,
    limit: sql.placeholder("limit"),
    offset: sql.placeholder("offset"),
    with: caseResponseWith,
    orderBy: desc(cases.createdAt),
  })
  .prepare("select_cases") as PgPreparedQuery<
  PreparedQueryConfig & {
    execute: CaseResponse[];
  }
>;

export const selectCaseById = db.query.cases
  .findFirst({
    where: eq(cases.id, sql.placeholder("id")),
    columns: caseResponseColumns,
    with: caseResponseWith,
  })
  .prepare("select_case_by_id") as PgPreparedQuery<
  PreparedQueryConfig & {
    execute: CaseResponse;
  }
>;

export const selectCasesByIds = (ids: number[]) =>
  db.query.cases
    .findMany({
      where: inArray(cases.id, ids),
      columns: caseResponseColumns,
      with: caseResponseWith,
    })
    .prepare("select_cases_by_id") as PgPreparedQuery<
    PreparedQueryConfig & {
      execute: CaseResponse[];
    }
  >;

export function serializeCase(
  _case: CaseResponse,
  _userId?: number | undefined,
): CaseSerialized {
  const serializedCase = serializeDates(_case);

  return {
    barriers: serializedCase.barriers,
    categoryTags: serializedCase.categoryTags,
    challengeDescription: serializedCase.challengeDescription,
    contactEmail: serializedCase.contactEmail,
    contactName: serializedCase.contactName,
    contactOrganization: serializedCase.contactOrganization,
    contactPublic: serializedCase.contactPublic,
    contactTitle: serializedCase.contactTitle,
    createdAt: serializedCase.createdAt,
    dataText: serializedCase.dataText,
    freeText: serializedCase.freeText,
    id: serializedCase.id,
    importanceDescription: serializedCase.importanceDescription,
    organizationType: serializedCase.organizationType as OrganizationType,
    sector: serializedCase.sector as OrganizationSector,
    solutions: serializedCase.solutions,
    title: serializedCase.title,
    updatedAt: serializedCase.updatedAt,
    isOwned: _userId ? _case.userId === _userId : false,
  } satisfies CaseSerialized;
}

export function serializeCases(
  _cases: CaseResponse[],
  _userId?: number | undefined,
): CaseSerialized[] {
  return _cases.map((c) => serializeCase(c, _userId));
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
      message: "Du har ikke adgang til at redigere i denne case",
    });
  }
}
