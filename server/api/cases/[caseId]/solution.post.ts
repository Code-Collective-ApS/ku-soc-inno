import * as z from "zod";
import { readFiles } from "h3-formidable";
import {
  addSolutionCategories,
  addSolutionFileRows,
  createSolutionRow,
  getSolutionFields,
  getSolutionFiles,
  uploadSolutionFiles,
} from "~~/server/utils/resources/solution";

const paramDto = z.strictObject({
  caseId: z.coerce.number().positive().max(2147483647), // sane max
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const config = useRuntimeConfig().public;
  const maxAttachmentSize = config.maxAttachmentSize;
  const maxIllustrationSize = config.maxIllustrationSize;
  const maxPdfSize = config.maxPdfSize;
  const params = await getValidatedRouterParams(event, paramDto.parse);

  const caseRes = await selectCaseById.execute({ id: params.caseId });
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
  const insertedId = await createSolutionRow(
    parsedFields,
    user.id,
    params.caseId,
  );

  const { attachmentObjects, illustrationObjects, primaryPdf } =
    await uploadSolutionFiles(insertedId, parsedFiles, {
      deleteSolutionOnFailure: true,
    });

  await db.transaction(async (tx) => {
    await addSolutionFileRows(
      tx,
      insertedId,
      attachmentObjects,
      illustrationObjects,
      primaryPdf,
    );

    await addSolutionCategories(
      tx,
      insertedId,
      parsedFields.solutionCategories,
    );
  });

  // remove temporary files if any
  await dispose();

  setResponseStatus(event, 201);

  return { solutionId: insertedId };
});
