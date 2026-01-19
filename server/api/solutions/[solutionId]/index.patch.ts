import * as z from "zod";
import { readFiles } from "h3-formidable";
import {
  addSolutionCategories,
  addSolutionFileRows,
  getSolutionFields,
  getSolutionFiles,
  removeSolutionCategories,
  updateSolutionRow,
  uploadSolutionFiles,
} from "~~/server/utils/resources/solution";

const paramDto = z.strictObject({
  solutionId: z.coerce.number().positive().max(2147483647), // sane max
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const config = useRuntimeConfig().public;
  const maxAttachmentSize = config.maxAttachmentSize;
  const maxIllustrationSize = config.maxIllustrationSize;
  const maxPdfSize = config.maxPdfSize;
  const params = await getValidatedRouterParams(event, paramDto.parse);

  const solution = await selectSolutionById(params.solutionId);
  if (!solution) {
    throw createError({
      statusCode: 404,
      message: "Solution was not found",
    });
  }

  if (solution.userId !== user.id) {
    throw createError({
      message: "You dont have permission to edit this solution",
      statusCode: 403,
    });
  }

  const caseRes = await selectCaseById.execute({ id: solution.caseId });
  if (!caseRes) {
    throw createError({
      statusCode: 404,
      message: "Case was not found",
    });
  }

  const { files, fields } = await readFiles(event, {
    // h3-formidable sucks
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    maxTotalFileSize: 1 * 1024 * 1024 * 1024,
  });

  const parsedFields = await getSolutionFields(fields).catch((e) => {
    console.error(e);
    const msg = e?.message || "Unknown error";
    throw createError({
      statusCode: 400,
      message: msg,
    });
  });

  const { parse, dispose } = getSolutionFiles(
    files,
    maxAttachmentSize,
    maxIllustrationSize,
    maxPdfSize,
  );

  const parsedFiles = await parse();

  await updateSolutionRow(solution.id, parsedFields);

  const { attachmentObjects, illustrationObjects, primaryPdf } =
    await uploadSolutionFiles(solution.id, parsedFiles);

  await db.transaction(async (tx) => {
    await removeAllSolutionFileRows(tx, solution.id);
    await addSolutionFileRows(
      tx,
      solution.id,
      attachmentObjects,
      illustrationObjects,
      primaryPdf,
    );

    await removeSolutionCategories(tx, solution.id);
    await addSolutionCategories(
      tx,
      solution.id,
      parsedFields.solutionCategories,
    );
  });

  // remove temporary files if any
  await dispose();

  setResponseStatus(event, 204);
});
