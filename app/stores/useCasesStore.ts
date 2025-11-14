import { defineStore } from "pinia";
import type { CaseSerialized } from "~~/server/utils/resources/case";
import { ref, parseApiError, useRequestFetch, type Ref } from "#imports";
import type { FetchContext, FetchResponse, ResponseType } from "ofetch";

type FetchCasesContext = FetchContext<
  { cases: CaseSerialized[] },
  ResponseType
> & {
  response: FetchResponse<{ cases: CaseSerialized[] }>;
};

type FetchCasesErrorContext = FetchContext<
  { cases: CaseSerialized[] },
  ResponseType
> & {
  error: Error;
};

type FetchCaseContext = FetchContext<{ case: CaseSerialized }, ResponseType> & {
  response: FetchResponse<{ case: CaseSerialized }>;
};

type FetchCaseErrorContext = FetchContext<
  { case: CaseSerialized },
  ResponseType
> & {
  error: Error;
};

export const useCasesStore = defineStore("cases", () => {
  const cases = ref<CaseSerialized[]>([]);
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
      onResponse: async (ctx: FetchCasesContext) => {
        if (ctx.response._data?.cases && ctx.response.status === 200) {
          cases.value = ctx.response._data.cases as CaseSerialized[];
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
      onResponseError: (ctx: FetchCasesContext) => {
        console.error(ctx.error);
        pending.value = false;
        // TODO: report error
      },
      onRequestError: (ctx: FetchCasesErrorContext) => {
        console.error(ctx.error);
        pending.value = false;
        // TODO: report error
      },
    });
  }

  async function fetchCase(id: number): Promise<{ case: CaseSerialized }> {
    // TODO: make more generic / replace with function / something else
    const existingIndex = cases.value.findIndex(
      (c: CaseSerialized) => c.id === id,
    );
    if (existingIndex !== -1) {
      const existingCase = cases.value[existingIndex] as CaseSerialized;
      const res: Record<string, CaseSerialized> = {};
      res.case = existingCase;
      // console.log("using cached case");
      return res as { case: CaseSerialized };
    }
    const res = useRequestFetch()(`/api/cases/${id}`, {
      server: true,
      credentials: "include",
      // cache: "force-cache",
      onRequest: () => {
        console.log("pinia fetching case by id..");
        pending.value = true;
      },
      onResponse: async (ctx: FetchCaseContext) => {
        if (ctx.response._data?.case && ctx.response.status === 200) {
          // console.log("got case by id, res:", ctx.response._data);
          pending.value = false;
        } else {
          console.log(
            "Throwing error ! unable to fetch case by id",
            ctx.response.status,
          );

          pending.value = false;
          throw await parseApiError(ctx.response);
        }
      },
      onResponseError: (ctx: FetchCaseContext) => {
        console.error(ctx.error);
        pending.value = false;
        // TODO: report error
      },
      onRequestError: (ctx: FetchCaseErrorContext) => {
        console.error(ctx.error);
        pending.value = false;
        // TODO: report error
      },
    });
    return res as Promise<{ case: CaseSerialized }>;
  }

  return { fetchCase, fetchCases, cases, pendingCases: pending };
});
