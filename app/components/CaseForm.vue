<template>
  <UForm
    :schema="createCaseSchema"
    :state="state"
    :validate-on="['input', 'change', 'blur']"
    class="space-y-4"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-[1fr_350px] gap-x-9">
      <div>
        <h2 class="font-bold">Case specification</h2>
        <UCard variant="subtle" class="mt-4">
          <div class="flex flex-col gap-y-3">
            <UFormField label="Titel på case" name="title">
              <UInput
                v-model="state.title"
                size="xl"
                class="w-[420px]"
                @keydown.enter.prevent="
                  () => {
                    // NOTE: This block prevents enter btn from submitting the full form
                    // console.warn('On key down enter event prevented');
                  }
                "
              />
            </UFormField>

            <UFormField label="Vælg nøgleord til casen" name="categories">
              <CaseCategorySelector v-model="state.categories" />
            </UFormField>

            <UFormField
              label="Hvad er casens udfordring kort for talt ?"
              name="challengeDescription"
            >
              <UTextarea
                v-model="state.challengeDescription"
                :rows="9"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Hvorfor er denne udfordring vigtig at løse ?"
              name="importanceDescription"
            >
              <UTextarea
                v-model="state.importanceDescription"
                :rows="9"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Løsningsbarrierer" name="barriers">
              <BarrierSelector v-model="state.barriers" />
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
        <UButton size="xl" class="cursor-pointer mt-6" type="submit">
          Opret case
        </UButton>
      </div>

      <div class="flex flex-col gap-8">
        <div>
          <h2 class="font-bold">Organisation</h2>
          <UCard variant="subtle" class="mt-4 relative">
            <div class="flex flex-col gap-y-3">
              <UFormField label="Type" name="organizationType">
                <OrganizationTypeInput v-model="state.organizationType" />
              </UFormField>

              <UFormField label="Sektor" name="organizationSector">
                <OrganizationSectorInput v-model="state.organizationSector" />
              </UFormField>
            </div>
          </UCard>
        </div>
        <div>
          <h2 class="font-bold">Kontaktinformation</h2>
          <UCard variant="subtle" class="mt-4 relative">
            <div class="flex flex-col gap-y-3">
              <UCheckbox
                v-model="state.contactPublic"
                class="mb-2"
                label="Synliggør kontaktinformation for offentligheden"
              />
              <UFormField label="Navn" name="contactName">
                <UInput v-model="state.contactName" @keydown.enter.prevent="" />
              </UFormField>

              <UFormField label="Titel" name="contactTitle">
                <UInput
                  v-model="state.contactTitle"
                  @keydown.enter.prevent=""
                />
              </UFormField>

              <UFormField label="Organisation" name="contactOrganization">
                <UInput
                  v-model="state.contactOrganization"
                  @keydown.enter.prevent=""
                />
              </UFormField>
              <UFormField label="Email" name="contactEmail">
                <UInput
                  v-model="state.contactEmail"
                  @keydown.enter.prevent=""
                />
              </UFormField>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import {
  createCaseSchema,
  type CreateCaseSchema,
} from "~~/shared/schemas/createCaseSchema";

const { user } = useUserSession();
const { $csrfFetch } = useNuxtApp();

const state = reactive<Partial<CreateCaseSchema>>({
  title: "",
  challengeDescription: "",
  contactEmail: user.value?.email || "",
  contactName: user.value?.fullName || "",
  contactOrganization: user.value?.organization || "",
  contactPublic: false,
  contactTitle: user.value?.title || "",
  categories: [],
  barriers: [],
  freeText: "",
  importanceDescription: "",
  organizationSector: undefined,
  organizationType: undefined,
  dataText: "",
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<CreateCaseSchema>) {
  await $csrfFetch("/api/cases", {
    method: "POST",
    body: event.data,
    onResponse: async (ctx) => {
      if (ctx.response.status === 201) {
        toast.add({
          title: "Casen er nu oprettet",
          icon: "i-mdi-check",
          color: "success",
        });
        const id = ctx?.response?._data?.caseId;
        if (typeof id !== "number") {
          throw new Error("Returned case id was not a number");
        }
        navigateTo(`/cases/${id}`);
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
