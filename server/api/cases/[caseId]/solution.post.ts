import * as z from "zod";
import { type Fields, type Files, readFiles } from "h3-formidable";
import {
  createSolutionFieldsSchema,
  createSolutionFilesSchema,
} from "~~/shared/schemas/createSolutionSchema";
import { readFormidableFormFiles } from "~~/server/utils/upload";
import { uploadFile } from "~~/server/utils/s3";
import {
  fileUploads,
  solutionAttachments,
  solutionCategories,
  solutionIllustrations,
  solutionPdfs,
  solutions,
} from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import * as fs from "node:fs";

const paramDto = z.strictObject({
  caseId: z.coerce.number().positive().max(2147483647), // sane max
});

function getFields(fields: Fields) {
  const solutionCategories = JSON.parse(fields.solutionCategories?.[0]);
  const obj = {
    solutionCategories: solutionCategories,
    solutionDescription: fields.solutionDescription?.[0],
    isTested: fields.isTested?.[0] === "true",
    testingText: fields.testingText?.[0],
    primaryPdfPublic: fields.primaryPdfPublic?.[0] === "true",
    freeText: fields.freeText?.[0],
    title: fields.title?.[0],
  };
  return createSolutionFieldsSchema.parseAsync(obj);
}

function getFiles(
  files: Files,
  maxAttachmentSize: number,
  maxIllustrationSize: number,
  maxPdfSize: number,
) {
  const rawAttachments = files?.["attachments[]"];
  const rawIllustrations = files?.["illustrations[]"];
  const rawPrimaryPdf = files?.primaryPdf;
  const attachments: File[] = readFormidableFormFiles(
    rawAttachments,
    maxAttachmentSize,
  );
  const illustrations: File[] = readFormidableFormFiles(
    rawIllustrations,
    maxIllustrationSize,
    ["image/jpg", "image/png"],
  );
  const primaryPdf: File | undefined = readFormidableFormFiles(
    rawPrimaryPdf,
    maxPdfSize,
    ["application/pdf"],
  )?.[0];
  const obj = {
    attachments,
    illustrations,
    primaryPdf,
  };

  const dispose = async () => {
    const paths = [
      ...(rawAttachments || []).map((f: Files) => f.filepath as string),
      ...(rawIllustrations || []).map((f: Files) => f.filepath as string),
      ...(rawPrimaryPdf || []).map((f: Files) => f.filepath as string),
    ];

    for (const p of paths) {
      await fs.promises.unlink(p);
    }
  };

  return { parse: () => createSolutionFilesSchema.parseAsync(obj), dispose };
}

function generateFileUploadRow(f: File, fileUrl: string) {
  return {
    fileName: f.name,
    fileUrl: fileUrl,
    mimeType: f.type,
    lastModified: new Date(f.lastModified),
  };
}

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

  const parsedFields = await getFields(fields).catch((e) => {
    console.error(e);
    const msg = e?.message || "Unknown error";
    throw createError({
      statusCode: 400,
      message: msg,
    });
  });

  const { parse, dispose } = getFiles(
    files,
    maxAttachmentSize,
    maxIllustrationSize,
    maxPdfSize,
  );

  const parsedFiles = await parse();

  const res = await db
    .insert(solutions)
    .values({ ...parsedFields, userId: user.id, caseId: params.caseId })
    .returning({
      id: solutions.id,
    });

  const insertedId = res[0]?.id as number;
  const attachmentObjects: Array<ReturnType<typeof generateFileUploadRow>> = [];
  const illustrationObjects: Array<ReturnType<typeof generateFileUploadRow>> =
    [];
  const pdfObjects: Array<ReturnType<typeof generateFileUploadRow>> = [];

  // TODO: upload file into cloud, check if ok
  try {
    const prefix = "solution/" + insertedId;
    for (let i = 0; i < parsedFiles.attachments.length; i++) {
      const file = parsedFiles.attachments[i] as File;
      const buf = await file.bytes();
      const fileUrl = prefix + "/attachments/" + i;
      await uploadFile(fileUrl, buf);
      attachmentObjects.push(generateFileUploadRow(file, fileUrl));
    }

    for (let i = 0; i < parsedFiles.illustrations.length; i++) {
      const file = parsedFiles.illustrations[i] as File;
      const buf = await file.bytes();
      const fileUrl = prefix + "/illustrations/" + i;
      await uploadFile(fileUrl, buf);
      illustrationObjects.push(generateFileUploadRow(file, fileUrl));
    }

    const pdf = parsedFiles.primaryPdf as File;
    const pdfBuf = await pdf.bytes();
    const pdfUrl = prefix + "/primary-pdf.pdf";
    await uploadFile(pdfUrl, pdfBuf);
    pdfObjects.push(generateFileUploadRow(pdf, pdfUrl));
  } catch (e) {
    console.error("Unable to upload file!");
    console.error(e);
    // if uploading went wrong, delete the posted solution
    await db.delete(solutions).where(eq(solutions.id, insertedId));

    // TODO: report error!
    throw createError({
      statusCode: 500,
      message: "Something went wrong when uploading the files",
    });
  }

  // insert attachment fileuploads
  if (attachmentObjects?.length) {
    const insertedAttachmentFileUploads = (
      await db.insert(fileUploads).values(attachmentObjects).returning({
        id: fileUploads.id,
      })
    ).map((x) => x.id);

    // attach attachments to solution
    await db.insert(solutionAttachments).values(
      insertedAttachmentFileUploads.map((fileUploadId) => ({
        fileUploadId,
        solutionId: insertedId,
      })),
    );
  }

  if (illustrationObjects?.length) {
    // insert illustration fileuploads
    const insertedIllustrationFileUploads = (
      await db.insert(fileUploads).values(illustrationObjects).returning({
        id: fileUploads.id,
      })
    ).map((x) => x.id);

    // attach illustrations to solution
    await db.insert(solutionIllustrations).values(
      insertedIllustrationFileUploads.map((fileUploadId) => ({
        fileUploadId,
        solutionId: insertedId,
      })),
    );
  }

  // insert pdf fileuploads
  const insertedPdfFileUpload = (
    await db.insert(fileUploads).values(pdfObjects).returning({
      id: fileUploads.id,
    })
  ).map((x) => x.id);

  // attach pdf to solution
  await db.insert(solutionPdfs).values(
    insertedPdfFileUpload.map((fileUploadId) => ({
      fileUploadId,
      solutionId: insertedId,
    })),
  );

  // add solution categories
  await db.insert(solutionCategories).values(
    parsedFields.solutionCategories.map((cat) => ({
      solutionCategory: cat,
      solutionId: res[0]!.id,
    })),
  );

  // remove temporary files if any
  await dispose();

  setResponseStatus(event, 201);

  return { solutionId: res[0]!.id };
});
