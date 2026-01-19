<template>
  <UForm
    :schema="createSolutionSchema"
    :state="state"
    :validate-on="['input', 'change', 'blur']"
    class="space-y-4"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-[1fr_350px] gap-x-9">
      <div>
        <h2 class="font-bold">Løsning specifikation</h2>
        <UCard variant="subtle" class="mt-4">
          <div class="flex flex-col gap-y-3">
            <UFormField name="title" label="Titel på løsning">
              <UInput v-model="state.title" placeholder="Indtast titel" />
            </UFormField>

            <UFormField
              label="Skriv minimum 1 nøgleord som beskriver typen af løsning"
              name="solutionCategory"
            >
              <SolutionCategoryDropdown v-model="state.solutionCategories" />
            </UFormField>

            <UFormField
              label="Beskrivelse af løsning"
              name="solutionDescription"
            >
              <UTextarea
                v-model="state.solutionDescription"
                :rows="9"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Er løsningen testet?" name="isTested">
              <URadioGroup v-model="state.isTested" :items="isTestedRadios" />
            </UFormField>

            <UFormField
              :label="
                state.isTested
                  ? 'Hvordan er løsningen testet?'
                  : 'Hvordan kan løsningen testes?'
              "
              name="testingText"
            >
              <UTextarea
                v-model="state.testingText"
                :rows="9"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Rapport (PDF)" name="primaryPdf">
              <div class="flex gap-x-3 w-full">
                <UFileUpload
                  v-model="state.primaryPdf"
                  name="primaryPdfUrl"
                  position="outside"
                  color="neutral"
                  layout="list"
                  class="grid grid-cols-2 2xl:grid-cols-3 w-full"
                  description="PDF (max. 3MB)"
                  accept="application/pdf"
                  :ui="{
                    base: [
                      'w-full flex-1 bg-default border border-gray-400 cursor-pointer flex flex-col gap-2 items-stretch justify-center rounded-lg focus-visible:outline-2',
                      'transition-[background]',
                    ],
                  }"
                />
              </div>
            </UFormField>

            <UFormField
              class="mb-6"
              label="Vil du offentliggøre rapporten?"
              name="primaryPdfPublic"
            >
              <URadioGroup
                v-model="state.primaryPdfPublic"
                :items="isPrimaryPdfPublic"
              />
            </UFormField>

            <UFormField
              name="illustrations"
              label="Upload 0-5 billeder, storyboards eller tilsvarende materiale, der illustrerer løsning som billedfil (jpg eller png)"
            >
              <MultipleImagesFormComponent
                v-model="state.illustrations"
                :min="1"
                :max="5"
              />
            </UFormField>

            <UFormField
              label="Du kan evt. vedhæfte relaterede pdf, word, excel, lyd og videofiler til løsningen"
              name="attachments"
            >
              <AttachmentsFormComponent v-model="state.attachments" />
            </UFormField>

            <UFormField
              label="Tilføj evt. opmærksomhedspunkter omkring test og/eller implementering"
              name="freeText"
            >
              <UTextarea
                v-model="state.freeText"
                :rows="9"
                class="w-full"
                size="xl"
              />
            </UFormField>
          </div>

          <UAlert
            v-if="errorMsg"
            :title="
              enabled
                ? `Løsningen blev ikke ${isEditing ? 'redigeret' : 'oprettet'}. Fejlmeddelelse:`
                : `Løsninger kan ikke ${isEditing ? 'redigeres' : 'oprettes'} i øjeblikket. Fejlmeddelelse:`
            "
            :description="errorMsg"
            variant="soft"
            color="error"
            icon="i-mdi-error-outline"
            class="mb-3 mt-6"
          >
            {{ errorMsg }}
          </UAlert>

          <div class="mt-6">
            <UButton
              size="xl"
              class="cursor-pointer"
              :loading="loading"
              :disabled="!enabled"
              @click="(e) => onSubmit(e)"
            >
              {{ isEditing ? "Gem" : "Opret" }} løsning
            </UButton>
          </div>
        </UCard>
      </div>

      <div></div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import {
  createSolutionSchema,
  type CreateSolutionSchema,
} from "~~/shared/schemas/createSolutionSchema";
const loading = ref(false);
const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const enabled = ref(true);
const emit = defineEmits<{ "created:solution": []; "updated:solution": [] }>();
const isTestedRadios = ref([
  { label: "Ja", value: true },
  { label: "Nej", value: false },
]);
const isPrimaryPdfPublic = ref([
  { label: "Ja", value: true },
  { label: "Nej", value: false },
]);

const errorMsg = ref("");
const props = defineProps({
  caseId: {
    type: Number,
    required: true,
  },
  solution: {
    type: Object as PropType<SolutionSerialized>,
    required: false,
    default: () => undefined,
  },
});

const s = computed(() => props.solution);
const isEditing = computed(() => !!props.solution);

function fetchSolutionFile(
  solutionId: number,
  resourceType: "pdfs" | "attachments" | "illustrations",
  resource:
    | SolutionPdfSerialized
    | SolutionIllustrationSerialized
    | SolutionAttachmentSerialized,
): Promise<File> {
  const pdfUrl = `/api/solutions/${solutionId}/${resourceType}/${resource.id}`;
  return new Promise((ok, reject) => {
    $csrfFetch(pdfUrl, {
      method: "GET",
      onResponse: async (ctx) => {
        if (ctx.response.ok) {
          const blob = ctx.response._data as Blob;
          const file = new File(
            [blob],
            "fileName" in resource ? resource?.fileName : "No name",
            {
              type: resource.mimeType,
            },
          );
          ok(file);
        } else {
          const msg = await parseApiError(
            ctx.response._data || ctx.error || ctx.response,
          );
          throw new Error(msg);
        }
      },
    }).catch((e) => reject(e));
  });
}

// fetch all files related to this solution
onMounted(async () => {
  if (!import.meta.client) return;
  const err = (msg: string) => {
    console.error(msg);
    errorMsg.value = msg;
  };
  try {
    if (props.solution?.solutionPdfs?.length) {
      const _primaryPdf = props.solution.solutionPdfs[0]!;
      const _primaryPdfFile = await fetchSolutionFile(
        props.solution.id,
        "pdfs",
        _primaryPdf,
      );
      state.primaryPdf = _primaryPdfFile;
    }
    if (props.solution?.illustrations?.length) {
      const illuFiles: File[] = [];
      for (const illu of props.solution.illustrations) {
        const illuFile = await fetchSolutionFile(
          props.solution.id,
          "illustrations",
          illu,
        );
        illuFiles.push(illuFile);
      }
      state.illustrations = illuFiles;
    }
    if (props.solution?.attachments?.length) {
      const attFiles: File[] = [];
      for (const att of props.solution.attachments) {
        const attFile = await fetchSolutionFile(
          props.solution.id,
          "attachments",
          att,
        );
        attFiles.push(attFile);
      }
      state.attachments = attFiles;
    }
  } catch (e: unknown) {
    console.error("Unable to fetch files!");
    console.error(e);
    console.error((e as Error)?.message);
    // report error
    toast.add({
      title: "Unable to fetch files",
      description: "You cannot edit the solution at the moment",
      color: "error",
    });
    enabled.value = false;
    errorMsg.value = "Unable to fetch files";
    err((e as Error)?.message || (e as string) || "Unknown error");
  }
});

const state = reactive<Partial<CreateSolutionSchema>>({
  isTested: s.value?.isTested || false,
  primaryPdfPublic: s.value?.primaryPdfPublic || false,
  primaryPdf: undefined, // files are handled in onMounted hook
  attachments: [], // files are handled in onMounted hook
  illustrations: [], // files are handled in onMounted hook
  title: s.value?.title || "",
  solutionCategories:
    s.value?.solutionCategories?.map((c) => c.solutionCategory) || [],
  solutionDescription: s.value?.solutionDescription || "",
  testingText: s.value?.testingText || "",
  freeText: s.value?.freeText || "",
});

async function onSubmit(
  event: undefined | MouseEvent | FormSubmitEvent<CreateSolutionSchema>,
) {
  loading.value = true;
  errorMsg.value = "";
  const payload =
    (event as FormSubmitEvent<CreateSolutionSchema>)?.data ?? state;

  const body = new FormData();
  body.append("isTested", !!state.isTested + "");
  body.append("title", state.title + "");
  body.append("primaryPdfPublic", !!state.primaryPdfPublic + "");
  body.append(
    "solutionCategories",
    JSON.stringify(state.solutionCategories) || "[]",
  );
  body.append("solutionDescription", state.solutionDescription ?? "");
  body.append("testingText", state.testingText ?? "");
  body.append("freeText", state.freeText ?? "");
  if (payload.primaryPdf) {
    body.append("primaryPdf", payload.primaryPdf!, payload.primaryPdf?.name);
  }
  for (const illu of payload.illustrations!) {
    body.append("illustrations[]", illu!, illu!.name);
  }
  for (const att of payload.attachments!) {
    body.append("attachments[]", att!, att!.name);
  }

  const method = isEditing.value ? "PATCH" : "POST";
  const url = isEditing.value
    ? `/api/solutions/${s.value!.id}`
    : `/api/cases/${props.caseId}/solution`;
  $csrfFetch(url, {
    method: method,
    body: body,
    onResponse: async (ctx) => {
      if ([201, 204].includes(ctx.response.status)) {
        toast.add({
          title:
            "Løsningen blev " + (isEditing.value ? "redigeret" : "oprettet"),
          icon: "i-mdi-check",
          color: "success",
        });

        const insertedId = ctx.response?._data?.solutionId || s.value?.id;
        loading.value = false;
        if (typeof insertedId !== "number") {
          throw new Error("Solution id is not defined");
        } else if (!isEditing.value) {
          emit("created:solution");
        } else if (isEditing.value) {
          emit("updated:solution");
        }
        navigateTo(`/cases/${props.caseId}/solutions/${insertedId}`);
      } else if (ctx.response.ok) {
        loading.value = false;
        throw new Error(
          "Response status code is not recognized: " + ctx.response.status,
        );
      }
    },
    onResponseError: async (ctx) => {
      const msg = await parseApiError(
        ctx.error || ctx.response || ctx || "Unknown error",
      );

      errorMsg.value = msg;
      // TODO: report error
      loading.value = false;
    },
  });
}
</script>
