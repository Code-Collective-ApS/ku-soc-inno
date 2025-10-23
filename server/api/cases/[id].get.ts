import { eq } from "drizzle-orm";
import * as z from "zod";
import { cases } from "~~/server/db/schema";
const queryDto = z.strictObject({
  id: z.coerce.number().positive(),
});

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);
  const params = await getValidatedRouterParams(event, queryDto.parse);

  const caseRes: CaseResponse | undefined = await db.query.cases.findFirst({
    where: eq(cases.id, params.id),
    columns: {
      id: true,
      challengeDescription: true,
      contactName: true,
      contactEmail: true,
      contactOrganization: true,
      contactPublic: true,
      contactTitle: true,
      importanceDescription: true,
      title: true,
      freeText: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      barriers: {
        columns: {
          id: true,
          barrier: true,
        },
      },
      categoryTags: {
        columns: {
          id: true,
          tag: true,
        },
      },
      solutions: {
        columns: {
          id: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!caseRes) {
    throw createError({
      statusCode: 404,
      statusMessage: "Case was not found",
    });
  }

  const includeContactInfo =
    caseRes.userId === user?.id || caseRes.contactPublic;
  if (!includeContactInfo) {
    stripCaseForContactInfo(caseRes);
  }

  return { case: caseRes };
});
