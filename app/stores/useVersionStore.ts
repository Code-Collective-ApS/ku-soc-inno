export const useVersionStore = defineStore("versionStore", () => {
  const version = ref("");
  const pending = ref(false);
  const error = ref("");

  async function refreshVersion() {
    return useRequestFetch()("/api/version", {
      method: "get",
      onRequest: (_ctx) => {
        pending.value = true;
      },
      onResponse: async (ctx) => {
        const data = ctx.response?._data;
        const newVersion = data.version;
        if (!newVersion || ctx.response.status !== 200) {
          const msg = await parseApiError(ctx);
          console.error(msg);
          pending.value = false;
          throw msg;
        } else {
          console.info(
            "api: got /version response:",
            ctx.response.status,
            // data,
          );
          version.value = data.version;
          pending.value = false;
        }
      },

      onResponseError: (ctx) => {
        console.error(ctx.error);
        pending.value = false;
        // TODO: report error
      },
      onRequestError: (ctx) => {
        console.error(ctx.error);
        pending.value = false;
        // TODO: report error
      },
    });
  }
  return { version, pending, error, refreshVersion };
});
