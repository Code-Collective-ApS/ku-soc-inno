<template>
  <div>
    <form class="flex flex-col gap-y-3" @submit.prevent="onSubmit">
      <label for="newPassword">New password</label>
      <UInput
        id="newPassword"
        v-model="newPassword"
        type="password"
        placeholder="Enter password"
      />
      <label for="emailInput">Repeat password</label>
      <UInput
        id="repeatPassword"
        v-model="repeatPassword"
        type="password"
        placeholder="Repeat new password"
      />
      <div v-if="error">
        <div class="text-sm text-error-500">
          {{ error }}
        </div>
      </div>
      <div class="flex justify-end mt-1.5">
        <UButton class="px-3 cursor-pointer" type="submit" :loading="loading">
          Gem password
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
import { validatePassword } from "#shared/utils/password_validation";
const newPassword = ref("");
const repeatPassword = ref("");
const successMsg = ref("");
const error = ref("");
const loading = ref(false);
const { $csrfFetch } = useNuxtApp();
const emit = defineEmits<{ close: [] }>();

const props = defineProps({
  jwt: {
    type: String,
    required: true,
  },
});

async function onSubmit() {
  loading.value = true;
  successMsg.value = "";
  error.value = "";
  const isTooWeak = validatePassword(newPassword.value);
  if (isTooWeak) {
    error.value = isTooWeak;
    loading.value = false;
    return;
  }

  if (repeatPassword.value !== newPassword.value) {
    error.value = "Passwordsne er ikke ens";
    loading.value = false;
    return;
  }

  try {
    await $csrfFetch("/api/auth/reset-password", {
      method: "POST",
      body: { new_password: newPassword.value, jwt: props.jwt },
      onResponse: async (ctx) => {
        if (ctx.response.status !== 204) {
          const msg = await parseApiError(ctx.error || ctx.response._data);
          throw new Error(msg);
        } else {
          successMsg.value =
            "Success! Dit password er opdateret. Redirecter til login siden..";

          setTimeout(async () => {
            emit("close");
            await navigateTo("/?openLoginModal=1&resetPassword=1");
          }, 4000);
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
</script>
