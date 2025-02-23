<template>
  <div class="min-h-screen bg-black">
    <NavBarComponent />

    <div class="min-h-screen flex items-center justify-center bg-black">
      <div
        class="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-700 relative"
      >
        <h2 class="text-3xl font-bold text-white text-center">Join Now</h2>
        <p class="text-gray-400 text-center mb-6">
          Sign up to start creating CloudSnips.
        </p>

        <form @submit.prevent="signUp" class="space-y-6">
          <div class="relative">
            <input
              type="email"
              v-model="email"
              placeholder="Email address"
              class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="absolute top-3 right-4 text-gray-500">📧</div>
          </div>

          <div class="relative">
            <input
              type="password"
              v-model="password"
              placeholder="Password"
              class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="absolute top-3 right-4 text-gray-500">🔒</div>
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition flex justify-center items-center"
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin border-4 border-white border-t-transparent rounded-full w-6 h-6"></span>
            <span v-else>Get Started</span>
          </button>

          <RouterLink to="/login">
            <p class="text-center text-sm text-gray-400 my-3">
              Already a member?
              <a href="#" class="text-blue-500 hover:text-blue-400">Log in</a>
            </p>
          </RouterLink>
        </form>

        <div v-if="errorMessage" class="text-red-500 text-center mt-4">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {apiGet, apiPost} from '../utils/makeApiCall'
import NavBarComponent from "../components/NavBarComponent.vue";
import { notify } from "@kyvg/vue3-notification";
import { useRouter } from "vue-router";

const email = ref("");
const username = ref("");
const password = ref("");
const errorMessage = ref(null);
const router = useRouter();
const loading = ref(false);

const signUp = async () => {
  loading.value = true;

  try {
    const response = await apiPost("/api/auth/register", {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    notify({
      title: "Sign-up Successful",
      text: "You have successfully signed up! Please confirm your account via email.",
      type: "success",
    });

    router.push({ path: "/confirm-registration", query: { email: email.value } });

  } catch (error) {

    notify({
      title: "Sign-up Failed",
      text: error,
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
