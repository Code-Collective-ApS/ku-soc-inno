<template>
  <UForm
    :schema="createCaseSchema"
    :state="state"
    :validate-on="['change', 'input']"
    class="space-y-4"
    @submit="onSubmit"
  >
    <h2 class="font-bold mt-12">Case specification</h2>
    <UFormField label="Titel på case" name="title">
      <UInput v-model="state.title" size="xl" class="w-[420px]" />
    </UFormField>

    <UFormField label="Categories" name="categories">
      <CaseCategorySelecter v-model="state.categories" />
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

    <UFormField label="Free text" name="freeText">
      <UTextarea v-model="state.freeText" :rows="9" class="w-full" size="xl" />
    </UFormField>

    <h2 class="font-bold mt-12">Kontakt information</h2>
    <UCheckbox
      v-model="state.contactPublic"
      label="Make contact information publicly available"
    />
    <UFormField label="Kontakt name" name="contactName">
      <UInput v-model="state.contactName" />
    </UFormField>

    <UFormField label="Kontakt titel" name="contactTitle">
      <UInput v-model="state.contactTitle" />
    </UFormField>

    <UFormField label="Kontakt organization" name="contactOrganization">
      <UInput v-model="state.contactOrganization" />
    </UFormField>

    <UFormField label="Kontakt email" name="contactEmail">
      <UInput v-model="state.contactEmail" />
    </UFormField>

    <UButton class="cursor-pointer" type="submit"> Opret case </UButton>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
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
  freeText: "",
  importanceDescription: "",
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<CreateCaseSchema>) {
  console.log(event.data);

  await $csrfFetch("/api/cases", {
    method: "POST",
    body: event.data,
    onResponse: async (ctx) => {
      if (ctx.response.status === 201) {
        toast.add({
          title: "Your cases was successfully saved",
          icon: "i-mdi-check",
          color: "success",
        });
      } else {
        const msg = await parseApiError(
          ctx.error || ctx.response || "Unknown error",
        );
        toast.add({
          title: msg,
          color: "error",
        });
      }
    },
    onResponseError: async (ctx) => {
      const msg = await parseApiError(
        ctx.error || ctx.response || "Unknown error",
      );
      toast.add({
        title: msg,
        color: "error",
      });
    },
  });
}
</script>
