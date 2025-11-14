import { defineStore } from "pinia";
import { ref, parseApiError, useRequestFetch, createError } from "#imports";

export const useSolutionsStore = defineStore("solutions", () => {
  const solutions = ref<SolutionSerialized[]>([]);
  const pending = ref(false);

  async function fetchSolution(
    id: number,
  ): Promise<{ solution: SolutionSerialized }> {
    // TODO: make more generic / replace with function / something else
    const existingIndex = solutions.value.findIndex(
      (s: SolutionSerialized) => s?.id === id,
    );
    if (existingIndex !== -1) {
      const existingSolution = solutions.value[existingIndex];
      const res: Record<string, SolutionSerialized> = {};
      res.solution = existingSolution as SolutionSerialized;
      // console.log("using cached solution");
      return res as { solution: SolutionSerialized };
    }

    const res = useRequestFetch()(`/api/solutions/${id}`, {
      server: true,
      credentials: "include",
      cache: "force-cache",
      onRequest: () => {
        console.log("pinia fetching solution by id..");
        pending.value = true;
      },
      onResponse: async (ctx) => {
        if (ctx.response._data?.solution && ctx.response.status === 200) {
          // console.log("got solution by id, res:", ctx.response._data);
          pending.value = false;
        } else {
          console.log(
            "Throwing error ! unable to fetch solution by id",
            ctx.response.status,
          );

          pending.value = false;
          const msg = await parseApiError(ctx.response);
          throw createError({
            statusCode: ctx.response.status,
            statusMessage: msg,
          });
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

    return res as Promise<{ solution: SolutionSerialized }>;
  }

  return { fetchSolution, solutions, pendingSolutions: pending };
});
