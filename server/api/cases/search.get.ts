import { count, and, eq, notInArray, sql, countDistinct } from "drizzle-orm";
import * as z from "zod";
import { cases, categoryTags } from "~~/server/db/schema";
import {
  selectCasesByIds,
  serializeCases,
} from "~~/server/utils/resources/case";

const queryDto = z.strictObject({
  text: z.string().max(254),
  organization_type: z.string().max(64),
  sector: z.string().max(64),
  page: z.coerce.number().int().positive().max(9999),
});

const pageSize = 5;

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, queryDto.parse);
  const searchText = (query.text || "").toLowerCase().trim();

  const pageBegin = (query.page - 1) * pageSize;
  const pageEnd = query.page * pageSize;

  const _tagMatchesCount = await db
    .selectDistinct({ count: countDistinct(categoryTags.caseId) })
    .from(categoryTags)
    .where(eq(categoryTags.tag, searchText));

  const tagMatchesCount = _tagMatchesCount[0]?.count || 0;

  // fetch all case ids with categoryTags with exact match on `searchText`
  let tagMatchCaseIds: number[] = [];
  let tagMatchCasesResult: CaseResponse[] = [];
  if (searchText) {
    const fullMatches = await db
      .selectDistinct({
        case_id: categoryTags.caseId,
      })
      .from(categoryTags)
      .where(eq(categoryTags.tag, searchText))
      .offset(pageBegin)
      .limit(pageSize);
    tagMatchCaseIds = fullMatches
      .filter((x) => !!x.case_id)
      .map((x) => x.case_id!);
    tagMatchCasesResult = (await selectCasesByIds(
      tagMatchCaseIds,
    ).execute()) as CaseResponse[];
  }

  // search in case content by text if above did not return enough results with respect to pagination
  let textSearchCaseResult: CaseResponse[] = [];

  // set limit and offset to respect pagination and already fetched full keyword match cases
  const textSearchLimit = Math.min(pageEnd - tagMatchesCount, pageSize);
  const textSearchOffset = Math.max(pageBegin - tagMatchesCount, 0)
  const filters = [notInArray(cases.id, tagMatchCaseIds)];
  if (query.organization_type) {
    filters.push(eq(cases.organizationType, query.organization_type));
  }
  if (query.sector) {
    filters.push(eq(cases.sector, query.sector));
  }

  if (query.text) {
    const textQuery = sql`(
        setweight(to_tsvector('danish', ${cases.title}), 'A') ||
        setweight(to_tsvector('danish', ${cases.challengeDescription}), 'B') ||
        setweight(to_tsvector('danish', ${cases.importanceDescription}), 'C')
        ) @@ to_tsquery('danish', ${searchText})`;
    filters.push(textQuery);
  }

  // make search query in db to fetch case ids
  const textSearchTotal = (
    await db
      .select({ count: count() })
      .from(cases)
      .where(filters.length > 1 ? and(...filters) : filters[0])
  )[0].count;

  // make search query in db to fetch case ids
  if (tagMatchCaseIds.length < pageEnd) {
    const textSearchRes = await db
      .select({ id: cases.id })
      .from(cases)
      .where(filters.length > 1 ? and(...filters) : filters[0])
      .offset(textSearchOffset)
      .limit(textSearchLimit);

    // fetch all data related to these cases in a seperate query
    const textSearchCaseIds = textSearchRes.map((c) => c.id);
    textSearchCaseResult = (await selectCasesByIds(
      textSearchCaseIds,
    ).execute()) as CaseResponse[];
  }

  // concat and serialize search results using the two methods
  const result = [tagMatchCasesResult, textSearchCaseResult]
    .map((_cases) => serializeCases(_cases as CaseResponse[]))
    .reduce((sum, cur) => {
      sum.push(...cur);
      return sum;
    }, [] as CaseSerialized[]);

  return { cases: result, total: textSearchTotal + tagMatchesCount } satisfies {
    cases: CaseSerialized[];
    total: number;
  };
});
