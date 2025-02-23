<template>
  <div class="min-h-screen flex items-center justify-center bg-black">
    <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-lg">
      <h2 class="text-3xl font-bold text-white text-center mb-6">Verify Your Email</h2>
      <p class="text-gray-400 text-center mb-4">Enter the 6-digit code we sent to your email.</p>

      <form class="space-y-6">
        <div>

          <label class="block text-sm font-medium text-gray-400 mb-2">Verification Code</label>
          <input type="text"
                 v-model="confirmationCode"
                 maxlength="6"
                 class="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                 placeholder="123456"/>
        </div>

        <button
          @click.prevent="confirmCode"
          :disabled="loading"
                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition flex justify-center items-center">
          
            <span v-if="loading" class="animate-spin border-4 border-white border-t-transparent rounded-full w-6 h-6"></span>
            <span v-else>Verify Code</span>
        </button>


        <p class="text-center text-sm text-gray-400">
          Didn't get the code?
          <a href="#" class="text-blue-500 hover:text-blue-400">Resend</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { notify } from "@kyvg/vue3-notification";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { apiPost } from "../utils/makeApiCall";

const confirmationCode = ref("");
const errorMessage = ref("");
const loggedInUser = ref({});
const loading = ref(false);
const email = ref("");

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  email.value = route.query.email || "";
});


const confirmCode = async () => {

  loading.value = true;

  try {
    const response = await apiPost("/api/auth/confirm-registration", {
      username: email.value,
      confirmationCode: confirmationCode.value
    });

    notify({
      title: response.message,
      type: "success",
    });

    router.push("/login")

  } catch (error) {
    errorMessage.value = error?.response?.data?.error || "Invalid confirmation code. Please try again.";

    notify({
      title: "Account confirmation failed",
      text: errorMessage.value,
      type: "error",
    });
  } finally {
    loading.value = false;
  }

};
</script>
