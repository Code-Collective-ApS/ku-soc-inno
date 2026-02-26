import * as z from "zod";

const paramDto = z.strictObject({
  solutionId: z.coerce.number().positive().max(2147483647), // sane max
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const params = await getValidatedRouterParams(event, paramDto.parse);
  const beginTime = Date.now();

  const solRes = await selectSolutionById(params.solutionId);
  if (!solRes) {
    await waitABit(beginTime);
    throw createError({
      statusCode: 404,
      message: "Case was not found",
    });
  }

  const caseRes = await selectCaseById.execute({ id: solRes.caseId });
  if (!caseRes) {
    await waitABit(beginTime);
    throw createError({
      statusCode: 404,
      message: "Case was not found",
    });
  }

  if (solRes.userId !== user.id) {
    await waitABit(beginTime);
    // TODO: report error
    throw createError({
      statusCode: 403,
      message: "You don't own this solution and cannot delete it.",
    });
  }

  // marks case and solutions as removed
  await removeSolution(params.solutionId);
  setResponseStatus(event, 204);
});
