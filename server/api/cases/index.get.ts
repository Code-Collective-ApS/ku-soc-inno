import * as z from "zod";
import { serializeCases } from "~~/server/utils/resources/case";

const invalidTakeErr = "Invalid query parameter `take`";
const invalidOffsErr = "Invalid query parameter `offset`";
const queryDto = z.strictObject({
  take: z.coerce
    .number(invalidTakeErr)
    .positive(invalidTakeErr)
    .max(100, invalidTakeErr),
  offset: z.coerce.number(invalidOffsErr).min(0, invalidOffsErr),
  orderBy: z.enum(["newest"]),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  const query = await getValidatedQuery(event, queryDto.parse);
  const res = await selectNewestCases.execute({
    limit: query.take,
    offset: query.offset,
  });

  for (let i = 0; i < res.length; i++) {
    const c = res[i] as CaseResponse;
    const includeContactInfo = c.userId === user?.id || c.contactPublic;
    if (!includeContactInfo) {
      stripCaseForContactInfo(c);
    }
  }

  return { cases: serializeCases(res, user?.id) } satisfies { cases: CaseSerialized[] };
});
