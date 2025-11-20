import { eq } from "drizzle-orm";
import type { H3Event } from "h3";
import { setResponseHeader, createError } from "h3";
import {
  fileUploads,
  solutionAttachments,
  solutionIllustrations,
  solutionPdfs,
  solutions,
} from "~~/server/db/schema";
import { type SwapDatesWithStrings, serializeManyDates } from "../datetime";
import { db } from "../db";
import { fetchFileUpload } from "~~/server/utils/upload";

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
  const solRes = await db
    .select({
      id: solutions.id,
      userId: solutions.userId,
      caseId: solutions.caseId,
      solutionDescription: solutions.solutionDescription,
      solutionCategory: solutions.solutionCategory,
      freeText: solutions.freeText,
      isTested: solutions.isTested,
      testingText: solutions.testingText,
      primaryPdfPublic: solutions.primaryPdfPublic,
      updatedAt: solutions.updatedAt,
      createdAt: solutions.createdAt,
      dataText: solutions.dataText,
    })
    .from(solutions)
    .where(eq(solutions.id, id));

  if (solRes.length === 0)
    throw createError({
      statusCode: 404,
      statusMessage: "Solution was not found!",
    });

  type _SolutionResponse = (typeof solRes)[number] & {
    attachments: SolutionAttachmentResponse;
    illustrations: SolutionIllustrationResponse;
    solutionPdfs: SolutionPdfResponse;
  };

  const solution: Partial<_SolutionResponse> = solRes[0]!;
  solution.illustrations = await selectSolutionIllustrations(id);
  solution.solutionPdfs = await selectSolutionPdfs(id);
  solution.attachments = await selectSolutionAttachments(id);
  return solution as _SolutionResponse;
}

export type SolutionResponse = Awaited<ReturnType<typeof selectSolutionById>>;
export type SolutionAttachmentResponse = Awaited<
  ReturnType<typeof selectSolutionAttachments>
>;
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
      statusMessage: "Requested resource does not exist",
    });
  }

  const resource: T | undefined = getResources(solRes).find(
    (r) => r.id === resourceId,
  );
  if (!resource) {
    console.error("could not find resource in solution");
    throw createError({
      statusCode: 404,
      statusMessage: "Requested resource does not exist",
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
  } satisfies SolutionSerialized;
}
