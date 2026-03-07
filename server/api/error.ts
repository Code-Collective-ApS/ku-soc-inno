export default defineEventHandler(async (_event) => {
  throw new Error("test error");
});
