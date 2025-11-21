<template>
  <div class="flex flex-col gap-6">
    <div>
      <FormLabel
        :value="payload.email"
        :is-valid="
          (v) => {
            try {
              changeEmailSchema.parse(v);
              return true;
            } catch {
              return false;
            }
          }
        "
        class="pb-2"
        required
        >Ny email</FormLabel
      >
      <UInput v-model="payload.email" placeholder="Indtast email" />
    </div>
    <div class="flex flex-col gap-6">
      <div>
        <UButton
          color="info"
          variant="subtle"
          class="text-nowrap cursor-pointer"
          :disabled="!readyToSubmit"
          :loading="loading"
          @click="onSubmit"
          >Skift email</UButton
        >
      </div>
      <UAlert
        v-if="successMsg"
        :description="successMsg"
        variant="subtle"
        color="success"
        icon="i-mdi-check"
        class="light:text-success-600"
      />
      <UAlert
        v-if="errorMsg"
        :description="errorMsg"
        variant="subtle"
        color="error"
        icon="i-mdi-error-outline"
        class="light:text-error-600"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { changeEmailSchema } from "~~/shared/schemas/changeEmailSchema";

const { $csrfFetch } = useNuxtApp();
const { fetch } = useUserSession();

const payload = reactive({
  email: "",
});

const readyToSubmit = computed<boolean>(() => {
  try {
    changeEmailSchema.parse(payload);
    return true;
  } catch {
    return false;
  }
});
const newEmailError = ref("");
const successMsg = ref("");
const errorMsg = ref("");
const loading = ref(false);

// reset fields without resetting successMsg (called on api success response)
function reset() {
  payload.email = "";
  newEmailError.value = "";
  errorMsg.value = "";
}

async function onSubmit() {
  loading.value = true;
  $csrfFetch("/api/auth/change-email", {
    method: "POST",
    body: payload,
    onResponse: async (ctx) => {
      if (ctx.response.status !== 204) {
        const msg = await parseApiError(ctx.error || ctx.response._data);
        successMsg.value = "";
        errorMsg.value = msg;
      } else {
        successMsg.value = "Din email blev opdateret";
        reset();
        await fetch();
      }
      loading.value = false;
    },
    onResponseError: async (ctx) => {
      successMsg.value = "";
      errorMsg.value = await parseApiError(ctx.error || ctx.response._data);
      loading.value = false;
    },
  });
}
</script>
