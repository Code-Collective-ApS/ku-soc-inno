import * as z from "zod";
import { selectCaseById, serializeCase } from "~~/server/utils/resources/case";
const paramDto = z.strictObject({
  caseId: z.coerce.number().positive().max(2147483647), // sane max
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  const params = await getValidatedRouterParams(event, paramDto.parse);

  const caseRes = await selectCaseById.execute({ id: params.caseId });
  if (!caseRes) {
    throw createError({
      statusCode: 404,
      message: "Case was not found",
    });
  }

  const includeContactInfo =
    caseRes.userId === user?.id || caseRes.contactPublic;
  if (!includeContactInfo) {
    stripCaseForContactInfo(caseRes);
  }

  // typescript makes me crazy sometimes
  return {
    case: serializeCase(caseRes, user?.id),
  } satisfies { case: CaseSerialized };
});
