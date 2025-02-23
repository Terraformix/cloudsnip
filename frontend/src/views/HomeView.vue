<template>
  <div class="min-h-screen bg-black">
    <NavBarComponent />

    <main class="max-w-4xl mx-auto px-6 py-16">
      <div class="mb-12">
        <h2 class="text-5xl font-bold text-white mb-4">Short links, <br />big impact.</h2>
        <p class="text-gray-400 text-xl">The smarter way to shorten, share, and track your links.</p>
      </div>

      <div class="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-lg relative">
        <div class="space-y-8">
          <div class="relative">
            <div class="flex gap-4 items-center">
              <div class="relative flex-1">
                <input
                  v-model="originalUrl"
                  type="url"
                  placeholder="https://your-long-url.com"
                  class="w-full bg-black border border-gray-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <button
                  v-if="originalUrl"
                  @click="clearInput"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ❌
                </button>
              </div>

              <button
                @click="generateCloudSnip"
                :disabled="isLoading"
                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-8 py-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                {{ isLoading ? "Shortening..." : "Shorten" }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <StatisticComponent 
              v-for="(item, index) in statistics" 
              :key="index" 
              :title="item.title" 
              :text="item.text" 
            />
          </div>

          <div v-if="shortenedUrl" class="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-6">
            <p class="text-gray-400 text-sm">CloudSnip:</p>
            <a :href="shortenedUrl" target="_blank" class="text-blue-400 text-lg font-bold hover:underline">
              {{ shortenedUrl }}
            </a>

            <p class="text-gray-400 text-sm mt-4">Expires At:</p>
            <p class="text-white text-md">{{ expiresAt }}</p>

            <button
              @click="clearShortenedLink"
              class="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Clear
            </button>
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBarComponent from '../components/NavBarComponent.vue';
import StatisticComponent from '../components/StatisticComponent.vue';
import { apiPost } from '../utils/makeApiCall';

import { ref } from "vue";
import { notify } from '@kyvg/vue3-notification';
import { useAuthStore } from '../store/auth';
import config from '../config';

const originalUrl = ref("");
const authStore = useAuthStore();
const shortenedUrl = ref(null);
const expiresAt = ref(null);
const errorMessage = ref("");
const isLoading = ref(false);


const statistics = [
  { title: "Total Links", text: "1,234" },
  { title: "Total Clicks", text: "85.4K" },
  { title: "Active Users", text: "512" }
];

const generateCloudSnip = async () => {
  if (!authStore.isAuthenticated) {
    notify({
      title: "Error",
      text: "You need to be logged in to perform that action.",
      type: "error",
    });
    return;
  }

  if (!originalUrl.value.trim()) {
    errorMessage.value = "Please enter a valid URL.";
    return;
  }

const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+(\:[0-9]+)?)(\/[^\s]*)?$/i;
  if (!urlPattern.test(originalUrl.value)) {
    errorMessage.value = "Invalid URL format. Please enter a valid URL.";
    return;
  }

  errorMessage.value = "";
  isLoading.value = true;

  try {
    const response = await apiPost("/api/cloudsnips/generate", {
      originalUrl: originalUrl.value
    });

    if (response && response.cloudSnip) {
      shortenedUrl.value = `http://${config.hostname}/${response.cloudSnip.shortCode}`;
      expiresAt.value = new Date(response.cloudSnip.expiresAt).toLocaleString();

      await authStore.fetchLoggedInUserDetails(true); // Force refresh to update the store

      originalUrl.value = ""

      notify({
        title: "URL Shortened",
        text: "Your link has been successfully shortened!",
        type: "success",
      });

    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Error:", error);
    errorMessage.value = error.message || "An error occurred while shortening the URL.";
  } finally {
    isLoading.value = false;
  }
};

const clearInput = () => {
  originalUrl.value = "";
};

const clearShortenedLink = () => {
  shortenedUrl.value = null;
  expiresAt.value = null;
};

</script>
