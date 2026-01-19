import { and, eq, isNull } from "drizzle-orm";
import type { H3Event } from "h3";
import type * as z from "zod";
import { setResponseHeader, createError } from "h3";
import {
  fileUploads,
  solutionAttachments,
  solutionCategories,
  solutionIllustrations,
  solutionPdfs,
  solutions,
} from "~~/server/db/schema";
import { type SwapDatesWithStrings, serializeManyDates } from "../datetime";
import { uploadFile } from "../s3";
import { db, type Transaction } from "../db";
import {
  fetchFileUpload,
  readFormidableFormFiles,
} from "~~/server/utils/upload";
import * as fs from "node:fs";
import type { Fields, Files } from "h3-formidable";
import {
  createSolutionFieldsSchema,
  createSolutionFilesSchema,
} from "~~/shared/schemas/createSolutionSchema";

export type FileUploadRow = ReturnType<typeof generateFileUploadRow>;

export function selectSolutionIllustrations(solutionId: number) {
  return db
    .select({
      id: solutionIllustrations.id,
      fileUploadId: solutionIllustrations.fileUploadId,
      updatedAt: solutionIllustrations.updatedAt,
      createdAt: solutionIllustrations.createdAt,
      mimeType: fileUploads.mimeType,
    })
    .from(solutionIllustrations)
    .where(eq(solutionIllustrations.solutionId, solutionId))
    .innerJoin(
      fileUploads,
      eq(solutionIllustrations.fileUploadId, fileUploads.id),
    );
}

export function selectSolutionAttachments(solutionId: number) {
  return db
    .select({
      id: solutionAttachments.id,
      fileUploadId: solutionAttachments.fileUploadId,
      updatedAt: solutionAttachments.updatedAt,
      createdAt: solutionAttachments.createdAt,
      fileName: fileUploads.fileName,
      mimeType: fileUploads.mimeType,
    })
    .from(solutionAttachments)
    .where(eq(solutionAttachments.solutionId, solutionId))
    .innerJoin(
      fileUploads,
      eq(solutionAttachments.fileUploadId, fileUploads.id),
    );
}

export function selectSolutionPdfs(solutionId: number) {
  return db
    .select({
      id: solutionPdfs.id,
      fileUploadId: solutionPdfs.fileUploadId,
      updatedAt: solutionPdfs.updatedAt,
      createdAt: solutionPdfs.createdAt,
      fileName: fileUploads.fileName,
      mimeType: fileUploads.mimeType,
    })
    .from(solutionPdfs)
    .innerJoin(fileUploads, eq(solutionPdfs.fileUploadId, fileUploads.id))
    .where(eq(solutionPdfs.solutionId, solutionId));
}

export async function selectSolutionById(id: number) {
  const solRes = await db.query.solutions.findFirst({
    columns: {
      id: true,
      title: true,
      userId: true,
      caseId: true,
      solutionDescription: true,
      freeText: true,
      isTested: true,
      testingText: true,
      primaryPdfPublic: true,
      updatedAt: true,
      createdAt: true,
    },
    with: {
      solutionCategories: {
        columns: {
          id: true,
          solutionCategory: true,
        },
      },
    },
    where: and(eq(solutions.id, id), isNull(solutions.removedAt)),
  });

  if (!solRes)
    throw createError({
      statusCode: 404,
      message: "Solution was not found!",
    });

  type _SolutionResponse = typeof solRes & {
    attachments: SolutionAttachmentResponse;
    illustrations: SolutionIllustrationResponse;
    solutionPdfs: SolutionPdfResponse;
    solutionCategories: SolutionCategoryResponse[];
  };

  const solution: Partial<_SolutionResponse> = solRes;
  solution.illustrations = await selectSolutionIllustrations(id);
  solution.solutionPdfs = await selectSolutionPdfs(id);
  solution.attachments = await selectSolutionAttachments(id);
  return solution as _SolutionResponse;
}

export function removeSolutionsByUserId(
  userId: number,
  transaction?: Transaction,
) {
  // TODO: consider actually deleting files, or give it as an option
  return (transaction || db)
    .update(solutions)
    .set({
      removedAt: new Date(),
      primaryPdfPublic: false,
    })
    .where(eq(solutions.userId, userId));
}
export function getSolutionFields(fields: Fields) {
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

export function getSolutionFiles(
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

export function generateFileUploadRow(f: File, fileUrl: string) {
  return {
    fileName: f.name,
    fileUrl: fileUrl,
    mimeType: f.type,
    lastModified: new Date(f.lastModified),
  };
}

export async function uploadSolutionFiles(
  solutionId: number,
  parsedFiles: {
    attachments: File[];
    illustrations: File[];
    primaryPdf: File;
  },
) {
  const attachmentObjects: FileUploadRow[] = [];
  const illustrationObjects: FileUploadRow[] = [];
  let primaryPdf: FileUploadRow;

  try {
    const prefix = "solution/" + solutionId;
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
    if (!pdf) {
      throw new Error("Primary pdf is required");
    }

    const pdfBuf = await pdf.bytes();
    const pdfUrl = prefix + "/primary-pdf.pdf";
    await uploadFile(pdfUrl, pdfBuf);
    primaryPdf = generateFileUploadRow(pdf, pdfUrl);
  } catch (e) {
    console.error("Unable to upload file!");
    console.error(e);
    // if uploading went wrong, delete the posted solution
    await db.delete(solutions).where(eq(solutions.id, solutionId));

    // TODO: report error!
    throw createError({
      statusCode: 500,
      message: "Something went wrong when uploading the files",
    });
  }

  return {
    attachmentObjects,
    illustrationObjects,
    primaryPdf,
  };
}

// TODO: seperate server side & client side types
export type SolutionResponse = Awaited<ReturnType<typeof selectSolutionById>>;
export type SolutionAttachmentResponse = Awaited<
  ReturnType<typeof selectSolutionAttachments>
>;
export type SolutionCategoryResponse = {
  id: number;
  solutionCategory: string;
};
export type SolutionIllustrationResponse = Awaited<
  ReturnType<typeof selectSolutionIllustrations>
>;
export type SolutionPdfResponse = Awaited<
  ReturnType<typeof selectSolutionPdfs>
>;

export type SolutionPdfSerialized = SwapDatesWithStrings<
  SolutionPdfResponse[number]
>;
export type SolutionAttachmentSerialized = SwapDatesWithStrings<
  SolutionAttachmentResponse[number]
>;
export type SolutionIllustrationSerialized = SwapDatesWithStrings<
  SolutionIllustrationResponse[number]
>;

export type SolutionSerialized = SwapDatesWithStrings<
  Omit<
    Omit<Omit<SolutionResponse, "attachments">, "solutionPdfs">,
    "illustrations"
  > & {
    attachments: SolutionAttachmentSerialized[];
    solutionPdfs: SolutionPdfSerialized[];
    illustrations: SolutionIllustrationSerialized[];
    isOwned: boolean;
  }
>;

export function stripSolutionForPdfs(
  _solution: SolutionResponse,
): SolutionResponse {
  if (_solution) {
    _solution["attachments"] = [];
  }
  return _solution;
}

export function removeSolution(solutionId: number) {
  return db
    .update(solutions)
    .set({ removedAt: new Date() })
    .where(eq(solutions.id, solutionId));
}

export async function serveSolutionFile<
  T extends {
    id: number;
    fileUploadId: number;
    mimeType: string;
    fileName?: string;
  },
>(
  event: H3Event,
  solutionId: number,
  resourceId: number,
  getResources: (s: SolutionResponse) => T[],
  downloadAsFileName?: (r: T) => string,
) {
  const solRes = await selectSolutionById(solutionId);
  if (!solRes) {
    console.error("solution does not exist");
    throw createError({
      statusCode: 404,
      message: "Requested resource does not exist",
    });
  }

  const resource: T | undefined = getResources(solRes).find(
    (r) => r.id === resourceId,
  );
  if (!resource) {
    console.error("could not find resource in solution");
    throw createError({
      statusCode: 404,
      message: "Requested resource does not exist",
    });
  }

  const { readable } = await fetchFileUpload(resource.fileUploadId);

  setResponseHeader(event, "Content-Type", resource.mimeType);
  setResponseHeader(event, "Cache-Control", "Public, max-age=3600"); // one hour public cache
  if (downloadAsFileName) {
    const originalFileName = downloadAsFileName(resource);
    setResponseHeader(
      event,
      "Content-Disposition",
      `inline; filename="${originalFileName}"`,
    );
  }

  return readable;
}

// typescript makes me crazy sometimes
export function serializeSolution(
  _solution: SolutionResponse,
  userId?: number | undefined,
): SolutionSerialized {
  return {
    ..._solution,
    updatedAt: _solution.updatedAt?.toISOString?.(),
    createdAt: _solution.createdAt?.toISOString?.(),
    attachments: serializeManyDates<SolutionAttachmentResponse[number]>(
      _solution.attachments,
    ),
    solutionPdfs: serializeManyDates<SolutionPdfResponse[number]>(
      _solution.solutionPdfs,
    ),
    illustrations: serializeManyDates<SolutionIllustrationResponse[number]>(
      _solution.illustrations,
    ),
    isOwned: _solution.userId === userId,
  } satisfies SolutionSerialized;
}

export async function createSolutionRow(
  parsedFields: z.infer<typeof createSolutionFieldsSchema>,
  userId: number,
  caseId: number,
): Promise<number> {
  const v = { ...parsedFields, userId: userId, caseId: caseId };
  const res = await db.insert(solutions).values(v).returning({
    id: solutions.id,
  });
  const insertedId = res[0]?.id as number;
  return insertedId;
}

export async function updateSolutionRow(
  solutionId: number,
  parsedFields: z.infer<typeof createSolutionFieldsSchema>,
): Promise<void> {
  const patch = { ...parsedFields };
  await db.update(solutions).set(patch).where(eq(solutions.id, solutionId));
}

export async function removeAllSolutionFileRows(tx: Transaction, id: number) {
  console.log("removing solution file uploads with solution id", id);
  await tx
    .delete(solutionAttachments)
    .where(eq(solutionAttachments.solutionId, id));
  await tx
    .delete(solutionIllustrations)
    .where(eq(solutionIllustrations.solutionId, id));
  await tx.delete(solutionPdfs).where(eq(solutionPdfs.solutionId, id));
}

export async function addSolutionFileRows(
  tx: Transaction,
  solutionId: number,
  attachmentObjects: FileUploadRow[],
  illustrationObjects: FileUploadRow[],
  primaryPdf: FileUploadRow,
) {
  // insert attachment fileuploads
  if (attachmentObjects?.length) {
    const insertedAttachmentFileUploads = (
      await tx.insert(fileUploads).values(attachmentObjects).returning({
        id: fileUploads.id,
      })
    ).map((x) => x.id);

    // attach attachments to solution
    await tx.insert(solutionAttachments).values(
      insertedAttachmentFileUploads.map((fileUploadId) => ({
        fileUploadId,
        solutionId: solutionId,
      })),
    );
  }

  if (illustrationObjects?.length) {
    // insert illustration fileuploads
    const insertedIllustrationFileUploads = (
      await tx.insert(fileUploads).values(illustrationObjects).returning({
        id: fileUploads.id,
      })
    ).map((x) => x.id);

    // attach illustrations to solution
    await tx.insert(solutionIllustrations).values(
      insertedIllustrationFileUploads.map((fileUploadId) => ({
        fileUploadId,
        solutionId: solutionId,
      })),
    );
  }

  // insert pdf fileuploads
  const insertedPdfFileUpload = await tx
    .insert(fileUploads)
    .values(primaryPdf)
    .returning({
      id: fileUploads.id,
    });

  const insertedPdfFileUploadId = insertedPdfFileUpload[0]?.id;
  if (!insertedPdfFileUploadId)
    throw new Error("Pdf file upload db row insert did not return inserted id");

  // attach pdf to solution
  await tx.insert(solutionPdfs).values({
    fileUploadId: insertedPdfFileUploadId,
    solutionId: solutionId,
  });
}

// add solution categories
export function addSolutionCategories(
  tx: Transaction,
  solutionId: number,
  solutionCats: string[],
) {
  return tx.insert(solutionCategories).values(
    solutionCats.map((cat) => ({
      solutionCategory: cat,
      solutionId: solutionId,
    })),
  );
}

export function removeSolutionCategories(tx: Transaction, solutionId: number) {
  return tx
    .delete(solutionCategories)
    .where(eq(solutionCategories.solutionId, solutionId));
}
