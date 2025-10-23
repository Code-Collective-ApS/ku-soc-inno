import { desc, sql } from "drizzle-orm";
import { cases } from "~~/server/db/schema";
import { db } from "../db";

export const selectNewestCases = db.query.cases
  .findMany({
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
    },
    limit: sql.placeholder("limit"),
    offset: sql.placeholder("offset"),
    with: {
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
        columns: {
          id: true,
          updatedAt: true,
        },
      },
    },
    orderBy: desc(cases.createdAt),
  })
  .prepare("select_cases");

export type CaseResponse = Awaited<
  ReturnType<typeof selectNewestCases.execute>
>[number];

export function stripCaseForContactInfo(_case: CaseResponse): CaseResponse {
  _case.contactName = "";
  _case.contactEmail = "";
  _case.contactOrganization = "";
  _case.contactTitle = "";
  return _case;
}
