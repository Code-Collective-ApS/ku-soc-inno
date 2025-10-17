import { defineStore } from "pinia";

export const useCasesStore = defineStore("cases", () => {
  const cases = ref<CaseResponse[]>([]);
  const pending = ref(false);

  function fetchCases(take: Ref<number>, offset: Ref<number>) {
    return useRequestFetch()("/api/cases", {
      server: true,
      query: {
        offset: offset.value,
        take: take.value,
        orderBy: "newest", // TODO
      },
      credentials: "include",
      // cache: "force-cache",
      onRequest: () => {
        console.log("pinia fetching cases..");
        pending.value = true;
      },
      onResponse: async (ctx) => {
        if (ctx.response._data?.cases && ctx.response.status === 200) {
          cases.value = ctx.response._data.cases as CaseResponse[];
          console.log("got", cases.value.length, "cases");
          pending.value = false;
        } else {
          console.log(
            "Throwing error ! unable to fetch cases",
            ctx.response.status,
          );

          pending.value = false;
          throw await parseApiError(ctx.response);
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

  return { fetchCases, cases, pendingCases: pending };
});
