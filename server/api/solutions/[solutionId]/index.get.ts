import * as z from "zod";
import {
  serializeSolution,
  stripSolutionForPdfs,
} from "~~/server/utils/resources/solution";

const paramDto = z.strictObject({
  solutionId: z.coerce.number().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  const params = await getValidatedRouterParams(event, paramDto.parse);

  // const solRes = await selectSolutionById.execute({ id: params.solutionId });
  const solRes = await selectSolutionById(params.solutionId);
  if (!solRes) {
    throw createError({
      statusCode: 404,
      statusMessage: "Solution was not found",
    });
  }

  // strip solution of pdfs if necessary
  const isAuthorOfSolution = user && solRes.userId === user.id;
  if (!solRes.primaryPdfPublic && !isAuthorOfSolution) {
    stripSolutionForPdfs(solRes);
  }

  // typescript makes me crazy sometimes
  return {
    solution: serializeSolution(solRes),
  } as { solution: SolutionSerialized };
});
