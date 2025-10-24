import pkg from "../../package.json";
export default defineEventHandler(async (_ctx) => {
  return {
    version: pkg.version,
  };
});
