import { eq, ne, and } from "drizzle-orm";
import { barriers, cases, categoryTags } from "../../../db/schema";
import { patchCaseSchema } from "~~/shared/schemas/patchCaseSchema";
import { requireCaseEditingPermissions, selectCaseById } from "~~/server/utils/resources/case";
import * as z from "zod";
const paramDto = z.strictObject({
  caseId: z.coerce.number().positive(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, patchCaseSchema.parse);
  const { user } = await requireUserSession(event);
  const params = await getValidatedRouterParams(event, paramDto.parse);

  const caseRes = await selectCaseById.execute({ id: params.caseId });
  if (!caseRes) {
    throw createError({
      statusCode: 404,
      statusMessage: "Case was not found",
    });
  }

  // check for editing access / ownership
  requireCaseEditingPermissions(caseRes, user.id);

  // check for duplicate titles if user modifies title into an existing one
  const duplicateTitle = await db.query.cases.findFirst({
    where: and(
      ne(cases.id, caseRes.id),
      eq(cases.title, body.title),
    ),
    columns: {
      id: true,
    },
  });
  if (duplicateTitle) {
    throw createError({
      statusCode: 404,
      statusMessage: "The case title is already in use. It must be unique.",
    });
  }

  // patch case
  const patchedCase = await db
    .update(cases)
    .set({
      challengeDescription: body.challengeDescription,
      contactEmail: body.contactEmail,
      contactName: body.contactName,
      contactOrganization: body.contactOrganization,
      contactTitle: body.contactTitle,
      contactPublic: body.contactPublic,
      importanceDescription: body.importanceDescription,
      title: body.title,
      freeText: body.freeText,
      userId: user.id,
      organizationType: body.organizationType,
      sector: body.organizationSector,
      dataText: body.dataText,
      updatedAt: new Date(),
    })
    .where(eq(cases.id, caseRes.id))
    .returning({
      id: cases.id,
    });

  // create relation helpers
  const caseId = patchedCase[0]!.id;
  const newTags = body.categories.map((tag) => ({
    tag,
    caseId: patchedCase[0]!.id,
  }));
  const newBarriers = body.barriers.map((barrier) => ({
    barrier,
    caseId: patchedCase[0]!.id,
  }));

  // remove existing category tags + add new
  await db.transaction(async (tx) => {
    await tx.delete(categoryTags).where(eq(categoryTags.caseId, caseId))
    await tx.insert(categoryTags).values(newTags).returning({
      id: categoryTags.id,
      tag: categoryTags.tag,
    });
  });

  // remove existing barriers and add new ones
  await db.transaction(async (tx) => {
    await tx.delete(barriers).where(eq(barriers.caseId, caseId));
    await tx.insert(barriers).values(newBarriers).returning({
      id: categoryTags.id,
      barrier: barriers.barrier,
    });
  });

  setResponseStatus(event, 204);
});
