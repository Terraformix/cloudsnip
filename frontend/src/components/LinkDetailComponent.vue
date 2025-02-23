<template>
  <div class="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <div class="bg-gray-700 p-2 rounded-full">
          <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div>
          <div class="text-sm text-gray-400">CloudSnip</div>
          <div class="flex items-center gap-2">
            <div class="text-lg font-semibold text-white break-all">{{config.hostname}}/{{ cloudSnip.shortCode }}</div>
            <button 
              @click="copyToClipboard(`${config.hostname}/${cloudSnip.shortCode}`)" 
              :class="{'text-green-400': copied, 'text-blue-400': !copied}"
              class="hover:text-green-400 transition-colors duration-200 text-sm"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 bg-gray-900/50 px-4 py-2 rounded-full">
        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
        <span class="text-gray-300 text-sm">2,145 clicks</span>
      </div>
    </div>

    <div class="bg-gray-800/75 p-4 rounded-lg mb-6">
      <div class="mb-3">
        <div class="text-sm text-gray-500 mb-1">Original URL</div>
        <a href="#" class="text-blue-400 hover:text-blue-300 break-all text-base">
          {{ cloudSnip.originalUrl }}
        </a>
      </div>
      <div class="flex justify-between text-sm text-gray-300">
        <div>
          <span class="text-gray-500">Created:</span>
          <span class="ml-2">{{formatDate(cloudSnip.createdAt)}}</span>
        </div>
        <div>
          <span class="text-gray-500">Expires:</span>
          <span class="ml-2">{{formatDate(cloudSnip.expiresAt)}}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-4">
      <button
        @click="handleStatusUpdate"
        :disabled="isLoading"
        :class="[
          'flex items-center gap-3 text-white px-4 py-2 rounded-full transition-colors duration-200',
          cloudSnip.isActive ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-600',
          { 'disabled:bg-gray-500': isLoading }
        ]"
      >
        <span class="w-2 h-2 rounded-full" :class="cloudSnip.isActive ? 'bg-red-400' : 'bg-green-400'"></span>
        {{ cloudSnip.isActive ? "Deactivate" : "Activate" }}
      </button>

      <button
        @click="handleDelete"
        class="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import config from '../config';
import { apiGet } from "../utils/makeApiCall";

const props = defineProps({
  cloudSnip: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle', 'delete']);
const isLoading = ref(false);
const copied = ref(false);

const getShareablecloudSnip = (shortCode) => {
  return `${window.location.origin}/redirect/${shortCode}`;
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric', 
  });
}

const handleRedirect = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    const response = await apiGet(`/api/cloudsnips/${props.cloudSnip.shortCode}/redirect`);

    if (response.originalUrl) {
      window.open(response.originalUrl, '_blank');
    } else {
      throw new Error('Failed to redirect');
    }
  } catch (error) {
    console.error('Error during redirection:', error);
    alert('Failed to redirect. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy cloudSnip');
  }
};

const handleDelete = () => {
  emit('delete', props.cloudSnip.shortCode);
};

const handleStatusUpdate = () => {
  emit('updateStatus', props.cloudSnip.shortCode);
};
</script>
