<template>
  <form class="flex flex-col gap-y-3" @submit.prevent="onSubmit">
    <label for="emailInput">Email</label>
    <UInput
      id="emailInput"
      v-model="email"
      name="email"
      placeholder="Email"
      :disabled="!!queryEmail"
    />
    <label for="passwordInput">Password</label>
    <div class="flex flex-col gap-0.5">
      <UInput
        id="passwordInput"
        v-model="password"
        type="password"
        name="password"
        placeholder="Password"
      />
      <div class="flex justify-end">
        <UButton
          class="cursor-pointer px-0"
          size="xs"
          variant="link"
          @click="
            (_event) => {
              openForgotPasswordModal();
            }
          "
        >
          Glemt password
        </UButton>
      </div>
    </div>
    <div>
      <div class="text-error-500 mb-6">
        {{ error }}
      </div>
      <div class="flex flex-col gap-6 items-center">
        <div>
          <UButton
            :disabled="loading"
            :loading="loading"
            type="submit"
            size="lg"
            color="success"
            class="px-12"
          >
            Log ind
          </UButton>
        </div>
        <div class="flex flex-col text-center justify-center">
          <UButton
            class="cursor-pointer px-0 flex justify-center"
            size="xs"
            variant="link"
            @click="openCreateAccount"
          >
            Opret en konto
          </UButton>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { fromBase64Url } from "#shared/utils/base64_url";

const { $csrfFetch } = useNuxtApp();
const { fetch: refreshSession, user } = useUserSession();
const { openForgotPasswordModal, openCreateAccountModal } = useModals();

const emit = defineEmits<{
  close: [boolean];
}>();

const route = useRoute();
const toast = useToast();
const redirectTo = computed(() =>
  typeof route.query.redirectTo === "string" &&
  route.query.redirectTo.startsWith("/")
    ? route.query.redirectTo
    : "/cases/browse",
);
const queryEmail = computed<string | null>(() => {
  if (typeof route.query.email !== "string" || !route.query.email) return null;
  const email = fromBase64Url(route.query.email);
  if (!isValidEmail(email)) return null;
  return email;
});

const password = ref("");
const email = ref(queryEmail.value || "");
const error = ref("");
const loading = ref(false);

async function openCreateAccount() {
  openCreateAccountModal();
  emit("close", false);
}

function resetInputs() {
  password.value = "";
  email.value = "";
}

async function onSubmit(event: Event) {
  event.preventDefault();
  error.value = "";
  if (loading.value)
    throw new Error(
      "Detected login form submit while already waiting on response",
    );
  loading.value = true;

  try {
    const url = "/api/auth/login";
    await $csrfFetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      onResponseError: async (res) => {
        console.error(res);
        error.value = await parseApiError(res);
      },
      onResponse: async (res) => {
        if (res.response.status === 200) {
          emit("close", true);
          await refreshSession();
          setTimeout(() => {
            resetInputs();
          }, 300); // allow animations to finish :-)
          toast.add({
            color: "success",
            title: `Logget ind som ${user.value?.fullName}`,
            icon: "i-mdi-check",
          });
          makeSuccessRedirect();
        } else {
          console.error(res);
          const msg = await parseApiError(res.error || res.response._data);
          throw new Error(msg);
        }
      },
    });
  } catch (e: unknown) {
    console.error(e);
    error.value = (e as Error)?.message || "Ukendt fejl";
  } finally {
    loading.value = false;
  }

  return false;
}

async function makeSuccessRedirect() {
  if (redirectTo.value) {
    await navigateTo(redirectTo.value);
  } else {
    await navigateTo("/cases/browse");
  }
}
</script>
