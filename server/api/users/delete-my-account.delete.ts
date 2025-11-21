import { deleteUserAccount } from "~~/server/utils/resources/user";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  await deleteUserAccount(user.id);
  await clearUserSession(event);
  setResponseStatus(event, 204);
});
