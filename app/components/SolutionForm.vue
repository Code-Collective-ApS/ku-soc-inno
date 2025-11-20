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
            <UFormField label="Kategori på løsningen" name="solutionCategory">
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

            <UFormField label="Hovedopgave (PDF)" name="primaryPdf">
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
              name="illustrations"
              label="Upload 1-5 billeder, storyboards eller tilsvarende materiale, der illustrerer løsning som billedfil (jpg eller png)"
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

            <UFormField label="Dataindsamling" name="dataText">
              <UTextarea
                v-model="state.dataText"
                :rows="9"
                class="w-full"
                size="xl"
              />
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

          <div class="mt-6">
            <UButton
              size="xl"
              class="cursor-pointer"
              @click="(e) => onSubmit(e)"
            >
              Opret løsning
            </UButton>
          </div>
        </UCard>
      </div>

      <div>
        <h2 class="font-bold mb-4">Opret løsning</h2>
        <UCard variant="subtle" size="sm">
          <UFormField
            class="mb-6"
            label="Vil du offentliggøre hovedopgaven?"
            name="primaryPdfPublic"
          >
            <URadioGroup
              v-model="state.primaryPdfPublic"
              :items="isPrimaryPdfPublic"
            />
          </UFormField>
        </UCard>
      </div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import {
  createSolutionSchema,
  type CreateSolutionSchema,
} from "~~/shared/schemas/createSolutionSchema";

const isTestedRadios = ref([
  { label: "Ja", value: true },
  { label: "Nej", value: false },
]);
const isPrimaryPdfPublic = ref([
  { label: "Ja", value: true },
  { label: "Nej", value: false },
]);

const props = defineProps({
  caseId: {
    type: Number,
    required: true,
  },
});

const { $csrfFetch } = useNuxtApp();

const state = reactive<Partial<CreateSolutionSchema>>({
  isTested: false,
  primaryPdfPublic: false,
  primaryPdf: undefined,
  attachments: [],
  illustrations: [],
  solutionCategories: [],
  solutionDescription: "",
  testingText: "",
  freeText: "",
  dataText: "",
});

const toast = useToast();

async function onSubmit(
  event: undefined | MouseEvent | FormSubmitEvent<CreateSolutionSchema>,
) {
  const payload =
    (event as FormSubmitEvent<CreateSolutionSchema>)?.data ?? state;
  console.log("payload:", payload);

  const body = new FormData();
  body.append("isTested", !!state.isTested + "");
  body.append("primaryPdfPublic", !!state.primaryPdfPublic + "");
  body.append(
    "solutionCategories",
    JSON.stringify(state.solutionCategories) || "[]",
  );
  body.append("solutionDescription", state.solutionDescription ?? "");
  body.append("testingText", state.testingText ?? "");
  body.append("freeText", state.freeText ?? "");
  body.append("dataText", state.dataText ?? "");
  body.append("primaryPdf", payload.primaryPdf!, payload.primaryPdf?.name);
  for (const illu of payload.illustrations!) {
    body.append("illustrations[]", illu!, illu!.name);
  }
  for (const att of payload.attachments!) {
    body.append("attachments[]", att!, att!.name);
  }

  await $csrfFetch(`/api/cases/${props.caseId}/solution`, {
    method: "POST",
    body: body,
    onResponse: async (ctx) => {
      if (ctx.response.status === 201) {
        toast.add({
          title: "The solution was successfully created",
          icon: "i-mdi-check",
          color: "success",
        });
        const insertedId = ctx.response?._data?.solutionId;
        if (typeof insertedId !== "number") {
          throw new Error(
            "Create solution endpoint did not return inserted id",
          );
        }
        navigateTo(`/cases/${props.caseId}/solutions/${insertedId}`);
      } else if (ctx.response.ok) {
        throw new Error(
          "Response status code is not recognized: " + ctx.response.status,
        );
      }
    },
    onResponseError: async (ctx) => {
      const msg = await parseApiError(
        ctx.error || ctx.response || ctx || "Unknown error",
      );
      toast.add({
        icon: "material-symbols:error-circle-rounded-outline-sharp",
        title: msg,
        color: "error",
      });
    },
  });
}
</script>
