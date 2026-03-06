import * as z from "zod";
import { solutions } from "~~/server/db/schema";
import { serveSolutionFile } from "~~/server/utils/resources/solution";
import { eq } from "drizzle-orm";
import { captureException } from "@sentry/nuxt";

const paramDto = z.strictObject({
  solutionId: z.coerce.number().positive().max(2147483647), // sane max
  pdfId: z.coerce.number().positive().max(2147483647), // sane max
});

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, paramDto.parse);
  const { user } = await getUserSession(event);
  const sols = await db
    .select({
      primaryPdfPublic: solutions.primaryPdfPublic,
      userId: solutions.userId,
    })
    .from(solutions)
    .where(eq(solutions.id, params.solutionId));

  if (!sols.length) {
    const err = createError({
      message: "Solution not found",
      statusCode: 404,
    });
    captureException(err);
    throw err;
  }

  const sol = sols[0]!;
  const canDownloadPdf =
    sol.primaryPdfPublic || (user && user.id === sol.userId);
  if (!canDownloadPdf) {
    const err = createError({
      message: "You are not allowed to view this pdf",
      statusCode: 403,
    });
    captureException(err);
    throw err;
  }

  return serveSolutionFile(
    event,
    params.solutionId,
    params.pdfId,
    (s) => s.solutionPdfs,
    (a) => a.fileName,
  );
});
