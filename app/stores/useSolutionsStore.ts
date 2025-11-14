import { defineStore } from "pinia";
import type { SolutionResponse } from "~~/server/utils/resources/solution";

export const useSolutionsStore = defineStore("solutions", () => {
  const solutions = ref<SolutionResponse[]>([]);
  const pending = ref(false);

  async function fetchSolution(
    id: number,
  ): Promise<{ solution: SolutionResponse }> {
    // TODO: make more generic / replace with function / something else
    const existingIndex = solutions.value.findIndex((c) => c?.id === id);
    if (existingIndex !== -1) {
      const existingSolution = solutions.value[existingIndex];
      const res: Record<string, SolutionResponse> = {};
      res.solution = existingSolution;
      // console.log("using cached solution");
      return res as { solution: SolutionResponse };
    }

    return useRequestFetch()(`/api/solutions/${id}`, {
      server: true,
      credentials: "include",
      // cache: "force-cache",
      onRequest: () => {
        console.log("pinia fetching solution by id..");
        pending.value = true;
      },
      onResponse: async (ctx) => {
        if (ctx.response._data?.solution && ctx.response.status === 200) {
          console.log("got solution by id, res:", ctx.response._data);
          pending.value = false;
        } else {
          console.log(
            "Throwing error ! unable to fetch solution by id",
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

  return { fetchSolution, solutions, pendingSolutions: pending };
});
