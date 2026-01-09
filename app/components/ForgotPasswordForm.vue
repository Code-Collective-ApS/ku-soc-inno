<template>
  <div>
    <form class="flex flex-col gap-y-3" @submit.prevent="onSubmit">
      <label for="emailInput">Email</label>
      <UInput
        id="emailInput"
        v-model="email"
        name="email"
        placeholder="Email"
        @update:model-value="onInpUpdate"
      />
      <div v-if="error">
        <div class="text-sm text-error-500">
          {{ error }}
        </div>
      </div>
      <div class="flex justify-end mt-1.5">
        <UButton class="px-3 cursor-pointer" type="submit" :loading="loading">
          Send email
        </UButton>
      </div>
      <UAlert
        v-if="successMsg"
        :description="successMsg"
        variant="subtle"
        color="success"
        icon="i-mdi-check"
        class="light:text-success-600"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { isValidEmail } from "#shared/utils/is_valid_email";
const email = ref("");
const successMsg = ref("");
const error = ref("");
const loading = ref(false);
const { $csrfFetch } = useNuxtApp();

async function onSubmit() {
  loading.value = true;
  successMsg.value = "";
  error.value = "";
  if (!isValidEmail(email.value)) {
    error.value = "The email is invalid";
    return;
  }

  try {
    await $csrfFetch("/api/auth/send-forgot-password-email", {
      method: "POST",
      body: { email: email.value },
      onResponse: async (ctx) => {
        if (ctx.response.status !== 204) {
          const msg = await parseApiError(ctx.error || ctx.response._data);
          throw new Error(msg);
        } else {
          successMsg.value = "Success! Emailen er sendt";
        }
        loading.value = false;
      },
    });
  } catch (e) {
    const msg = await parseApiError(e);
    console.log("3 set api error to", msg, e);
    error.value = msg;
    loading.value = false;
  }

  return false;
}

function onInpUpdate() {
  error.value = "";
}
</script>
