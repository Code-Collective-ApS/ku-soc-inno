<template>
  <form class="flex flex-col gap-y-3" @submit.prevent="onSubmit">
    <label for="emailInput">Email</label>
    <UInput id="emailInput" v-model="email" name="email" placeholder="Email" />
    <label for="passwordInput">Password</label>
    <UInput
      id="passwordInput"
      v-model="password"
      type="password"
      name="password"
      placeholder="Password"
    />
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
            Log in
          </UButton>
        </div>
        <div class="flex justify-center">
          <UButton
            to="/create-account"
            class="cursor-pointer px-0"
            size="xs"
            variant="link"
            @click="() => emit('close', false)"
            >I want to create a beta user account</UButton
          >
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
const password = ref("");
const email = ref("");
const error = ref("");
const loading = ref(false);
const { $csrfFetch } = useNuxtApp();
const { fetch: refreshSession, user } = useUserSession();

const emit = defineEmits<{
  close: [boolean];
}>();

const route = useRoute();
const toast = useToast();
const redirectTo = computed(() =>
  typeof route.query.redirectTo === "string" &&
  route.query.redirectTo.startsWith("/")
    ? route.query.redirectTo
    : "/cases",
);

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
            title: `Logged in as ${user.value?.fullName}`,
            icon: "i-mdi-check",
          });
          makeSuccessRedirect();
        }
      },
    });
  } catch (e: unknown) {
    console.error(e);
    error.value = await parseApiError(e as Error);
  } finally {
    loading.value = false;
  }

  return false;
}

async function makeSuccessRedirect() {
  if (redirectTo.value) {
    await navigateTo(redirectTo.value);
  } else {
    await navigateTo("/cases");
  }
}
</script>
