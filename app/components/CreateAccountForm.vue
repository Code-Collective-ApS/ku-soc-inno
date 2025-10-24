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
    <label for="fullName">Full name</label>
    <UInput
      id="fullName"
      v-model="fullName"
      name="fullName"
      placeholder="Full name"
    />
    <label for="jobTitle">Job title</label>
    <UInput
      id="jobTitle"
      v-model="jobTitle"
      name="jobTitle"
      placeholder="E.g Student, PhD"
    />
    <label for="organization">Organization / Company / University</label>
    <UInput
      id="organization"
      v-model="organization"
      name="organization"
      placeholder=""
    />
    <div>
      <div class="text-error-500 mb-6">
        {{ error }}
      </div>
      <div>
        <UButton
          :disabled="loading"
          :loading="loading"
          type="submit"
          size="lg"
          color="success"
          class="px-12"
        >
          Create account
        </UButton>
      </div>
      <UAlert
        v-if="successMsg"
        :description="successMsg"
        variant="soft"
        color="success"
        icon="i-mdi-check"
        class="mb-3 mt-6"
      >
        {{ successMsg }}
      </UAlert>
    </div>
  </form>
</template>

<script setup lang="ts">
const password = ref("");
const email = ref("");
const fullName = ref("");
const jobTitle = ref("");
const organization = ref("");
const error = ref("");
const successMsg = ref("");
const loading = ref(false);
const { $csrfFetch } = useNuxtApp();

const emit = defineEmits<{
  "create-account-success": [];
}>();

function resetInputs() {
  password.value = "";
  email.value = "";
  fullName.value = "";
  jobTitle.value = "";
  organization.value = "";
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
    const url = "/api/users";
    await $csrfFetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        fullName: fullName.value,
        title: jobTitle.value,
        organization: organization.value,
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
          resetInputs();
          successMsg.value =
            "Success! We've sent you an email to finish account setup";
          emit("create-account-success");
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
</script>
