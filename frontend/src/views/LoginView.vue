<template>
  <div class="min-h-screen bg-black">
    <NavBarComponent />

    <div class="min-h-screen flex items-center justify-center bg-black">
      <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-700 relative">
        <h2 class="text-3xl font-bold text-white text-center">Welcome back!</h2>
        <p class="text-gray-400 text-center mb-6">Sign in to start creating CloudSnips.</p>

        <form @submit.prevent="signIn" class="space-y-6">
          <div class="relative">
            <input
              type="email"
              v-model="username"
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

          <div class="text-right">
            <a href="#" class="text-blue-500 hover:text-blue-400 text-sm">Forgot password?</a>
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition flex justify-center items-center"
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin border-4 border-white border-t-transparent rounded-full w-6 h-6"></span>
            <span v-else>Sign In</span>
          </button>

          <RouterLink to="/register">
            <p class="text-center text-sm text-gray-400 mt-2">
              Don't have an account? <span class="text-blue-500 hover:text-blue-400">Sign up</span>
            </p>
          </RouterLink>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBarComponent from "../components/NavBarComponent.vue";
import { apiPost } from "../utils/makeApiCall";
import { useAuthStore } from "../store/auth";
import { useNotification } from "@kyvg/vue3-notification";

const username = ref("");
const password = ref("");
const errorMessage = ref(null);
const authStore = useAuthStore();
const router = useRouter();
const { notify } = useNotification();
const loading = ref(false);

onMounted(() => {
  if (authStore.accessToken) {
    notify({ title: "Already Logged In", text: "You are already signed in!", type: "info" });
    router.push("/");
  }
});

const signIn = async () => {
  errorMessage.value = null;
  loading.value = true;
  try {
    const response = await apiPost("/api/auth/login", {
      username: username.value,
      password: "P@ssword123"
    });
    authStore.setAuthToken({
      accessToken: response.tokens.AccessToken,
      idToken: response.tokens.IdToken,
      refreshToken: response.tokens.RefreshToken,
    });
    notify({ title: "Login Successful", text: "You have been logged in successfully!", type: "success" });
    router.push("/");
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Invalid credentials. Please try again.";
    notify({ title: "Login Failed", text: errorMessage.value, type: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
