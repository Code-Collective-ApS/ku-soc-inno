import * as z from "zod";
import { selectCaseById } from "~~/server/utils/resources/case";
const queryDto = z.strictObject({
  id: z.coerce.number().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  const params = await getValidatedRouterParams(event, queryDto.parse);

  const caseRes = await selectCaseById.execute({ id: params.id });
  if (!caseRes) {
    throw createError({
      statusCode: 404,
      statusMessage: "Case was not found",
    });
  }

  const includeContactInfo =
    caseRes.userId === user?.id || caseRes.contactPublic;
  if (!includeContactInfo) {
    stripCaseForContactInfo(caseRes);
  }

  return { case: caseRes };
});
