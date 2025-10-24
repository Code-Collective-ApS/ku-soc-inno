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
              <SolutionCategoryDropdown v-model="state.solutionCategory" />
            </UFormField>

            <UFormField
              label="Beskrivelse af løsning"
              name="solutionDescription"
            >
              <UTextarea
                v-model="state.solutionCategory"
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

            <UFormField label="Hovedopgave (PDF)">
              <UFileUpload
                v-model="mainAssignment"
                required
                color="neutral"
                class="h-24 mb-6 w-full max-w-64"
                description="PDF (max. 3MB)"
                accept="application/pdf"
                :ui="{
                  base: [
                    'w-full flex-1 bg-default border border-gray-400 flex flex-col gap-2 items-stretch justify-center rounded-lg focus-visible:outline-2',
                    'transition-[background]',
                  ],
                }"
              />
            </UFormField>

            <UFormField
              label="Upload 1-5 billeder, storyboards eller tilsvarende materiale, der illustrerer løsning som billedfil (jpg eller png)"
            >
              <MultipleImagesFormComponent
                v-model="illustrations"
                :min="1"
                :max="5"
              />
            </UFormField>

            <UFormField
              label="Du kan evt. vedhæfte relaterede pdf, word, excel, lyd og videofiler til løsningen"
            >
              <AttachmentsFormComponent v-model="attachments" />
            </UFormField>

            <UFormField
              label="Andet, der er relevant at nævne?"
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
        </UCard>
      </div>

      <div>
        <h2 class="font-bold">Opret løsning</h2>
        <UButton size="xl" class="cursor-pointer mt-6" type="submit">
          Bekræft
        </UButton>
      </div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  createSolutionSchema,
  type CreateSolutionSchema,
} from "~~/shared/schemas/createSolutionSchema";

const isTestedRadios = ref([
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
  primaryPdfUrl: "",
  solutionCategory: "",
  solutionDescription: "",
  testingText: "",
  freeText: "",
});

// TODO: actually upload these
const mainAssignment = ref<File | undefined>(undefined);
const illustrations = ref<File[]>([]);
const attachments = ref<File[]>([]);

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<CreateSolutionSchema>) {
  console.log(event.data);

  await $csrfFetch(`/api/cases/${props.caseId}/solution`, {
    method: "POST",
    body: event.data,
    onResponse: async (ctx) => {
      if (ctx.response.status === 201) {
        toast.add({
          title: "The solution was successfully created",
          icon: "i-mdi-check",
          color: "success",
        });
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
