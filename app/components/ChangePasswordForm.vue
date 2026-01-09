<template>
  <div class="flex flex-col gap-6">
    <div>
      <FormLabel :value="payload.old" class="pb-2" required
        >Nuværende password</FormLabel
      >
      <UInput
        v-model="payload.old"
        type="password"
        placeholder="Indtast password"
      />
    </div>
    <div>
      <FormLabel
        :is-valid="validateNewPassword"
        :value="payload.new"
        class="pb-2"
        required
        >Nyt password</FormLabel
      >
      <UInput
        v-model="payload.new"
        type="password"
        placeholder="Indtast nyt password"
      />
      <div v-if="newPasswordError">
        <span class="text-error-500 font-mono inline-block py-1.5 text-xs">
          {{ newPasswordError }}
        </span>
      </div>
    </div>
    <div>
      <FormLabel
        :is-valid="validateRepeatPassword"
        :value="payload.repeat"
        class="pb-2"
        required
        >Gentag nyt password</FormLabel
      >
      <UInput
        v-model="payload.repeat"
        type="password"
        placeholder="Gentag nyt password"
      />
      <div v-if="repeatPasswordError">
        <span class="text-error-500 font-mono inline-block py-1.5 text-xs">
          {{ repeatPasswordError }}
        </span>
      </div>
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
          >Skift password</UButton
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
import { validatePassword } from "~~/shared/utils/password_validation";

const { $csrfFetch } = useNuxtApp();

const readyToSubmit = computed<boolean>(() => {
  if (!payload.old || !payload.new || !payload.repeat) return false;
  if (payload.new !== payload.repeat) return false;
  const validationErr = validatePassword(payload.new);
  if (validationErr) return false;
  return true;
});

const payload = reactive({
  old: "",
  new: "",
  repeat: "",
});
const newPasswordError = ref("");
const successMsg = ref("");
const errorMsg = ref("");
const repeatPasswordError = ref("");
const loading = ref(false);

// reset fields without resetting successMsg (called on api success response)
function reset() {
  payload.old = "";
  payload.new = "";
  payload.repeat = "";
  newPasswordError.value = "";
  repeatPasswordError.value = "";
  errorMsg.value = "";
}

// check for errors when there are changes in the payload
function validateNewPassword(): boolean {
  const err = (msg: string): boolean => {
    newPasswordError.value = msg;
    return false;
  };

  const validationErr = validatePassword(payload.new);
  if (validationErr) return err(validationErr);

  if (!payload.old) return err("Du mangler at indtaste dit nuværende password");
  if (payload.new === payload.old)
    return err("Kan ikke være identisk med det nuværende password");

  newPasswordError.value = "";
  return true;
}

function validateRepeatPassword(): boolean {
  if (payload.new !== payload.repeat) {
    repeatPasswordError.value = "Passwordsne matcher ikke";
    return false;
  }
  repeatPasswordError.value = "";
  return true;
}

async function onSubmit() {
  loading.value = true;
  $csrfFetch("/api/auth/change-password", {
    method: "POST",
    body: payload,
    onResponse: async (ctx) => {
      if (ctx.response.status !== 204) {
        const msg = await parseApiError(ctx.error || ctx.response._data);
        successMsg.value = "";
        errorMsg.value = msg;
      } else {
        successMsg.value = "Dit password blev opdateret";
        reset();
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
