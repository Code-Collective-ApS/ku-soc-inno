import * as z from "zod";
import { removeCase } from "~~/server/utils/resources/case";
const paramDto = z.strictObject({
  caseId: z.coerce.number().positive().max(2147483647), // sane max
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const params = await getValidatedRouterParams(event, paramDto.parse);
  const beginTime = Date.now();

  const caseRes = await selectCaseById.execute({ id: params.caseId });
  if (!caseRes) {
    await waitABit(beginTime);
    throw createError({
      statusCode: 404,
      message: "Case was not found",
    });
  }

  if (caseRes.userId !== user.id) {
    await waitABit(beginTime);
    throw createError({
      statusCode: 403,
      message: "You do not have access to this case",
    });
  }

  // marks case and solutions as removed
  await removeCase(caseRes);
  setResponseStatus(event, 204);
});
