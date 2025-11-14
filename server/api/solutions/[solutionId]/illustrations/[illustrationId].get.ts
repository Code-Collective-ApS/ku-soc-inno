import * as z from "zod";
import { serveSolutionFile } from "~~/server/utils/resources/solution";

const paramDto = z.strictObject({
  solutionId: z.coerce.number().positive(),
  illustrationId: z.coerce.number().positive(),
});

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, paramDto.parse);

  return serveSolutionFile(
    event,
    params.solutionId,
    params.illustrationId,
    (s) => s.illustrations,
  );
});
