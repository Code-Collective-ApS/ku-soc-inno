import * as z from "zod";
import { serveSolutionFile } from "~~/server/utils/resources/solution";

const paramDto = z.strictObject({
  solutionId: z.coerce.number().positive(),
  attachmentId: z.coerce.number().positive(),
});

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, paramDto.parse);

  return serveSolutionFile(
    event,
    params.solutionId,
    params.attachmentId,
    (s) => s.attachments,
    (a) => a.fileName,
  );
});
