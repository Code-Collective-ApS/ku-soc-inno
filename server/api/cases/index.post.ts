import { eq } from "drizzle-orm";
import { barriers, cases, categoryTags } from "../../db/schema";
import { createCaseSchema } from "~~/shared/schemas/createCaseSchema";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createCaseSchema.parse);
  const { user } = await requireUserSession(event);

  // check for duplicate title
  const existingCase = await db.query.cases.findFirst({
    where: eq(cases.title, body.title),
    columns: {
      id: true,
    },
  });

  if (existingCase) {
    throw createError({
      statusCode: 400,
      statusMessage: "The case title is already in use. It must be unique.",
    });
  }

  const createdCase = await db
    .insert(cases)
    .values({
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
    })
    .returning({
      id: cases.id,
    });

  // create tags
  const newTags = body.categories.map((tag) => ({
    tag,
    caseId: createdCase[0]!.id,
  }));
  await db.insert(categoryTags).values(newTags).returning({
    id: categoryTags.id,
    tag: categoryTags.tag,
  });

  // create tags
  const newBarriers = body.barriers.map((barrier) => ({
    barrier,
    caseId: createdCase[0]!.id,
  }));
  await db.insert(barriers).values(newBarriers).returning({
    id: categoryTags.id,
    barrier: barriers.barrier,
  });

  setResponseStatus(event, 201);
});
