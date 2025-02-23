<template>
  <div class="min-h-screen bg-black">
    <NavBarComponent />

    <main class="max-w-4xl mx-auto px-6 py-16">
      <div class="mb-12">
        <h2 class="text-4xl font-bold text-white">User Profile</h2>
        <p class="text-gray-400 text-lg">Manage your account and track your CloudSnips.</p>
      </div>

      <div class="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg mb-8">
        <h3 class="text-2xl text-white font-semibold mb-4">Profile Information</h3>
        
        <div class="flex items-center gap-4 mb-6">
          <label class="cursor-pointer relative">
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept="image/*" 
              @change="handleFileUpload"
            />
            <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white text-2xl font-semibold border-2 border-gray-500 hover:border-blue-400 transition-all">
              <img v-if="user.avatarUrl || previewAvatar" :src="previewAvatar || user.avatarUrl" alt="Avatar" class="text-center object-cover">
              <span v-else>Avatar</span>
            </div>
          </label>
          <div>
            <p class="text-lg font-semibold text-white">{{ user.email }}</p>
          </div>
        </div>

        <div class="text-gray-300 space-y-2">
          <p><span class="font-semibold text-white">User ID:</span> {{ user.userId }}</p>
          <p><span class="font-semibold text-white">Joined:</span> {{ new Date(user.createdAt).toLocaleString() }}</p>
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg mb-8">
        <h3 class="text-2xl text-white font-semibold mb-4">Your Stats</h3>
        <div class="grid grid-cols-3 gap-6 text-center">
            <StatisticComponent :title="'Active CloudSnips'" :text="statistics.activeCloudSnips" />
            <StatisticComponent :title="'Inactive CloudSnips'" :text="statistics.inactiveCloudSnips" />
            <StatisticComponent :title="'Valid CloudSnips'" :text="statistics.validCloudSnips" />
            <StatisticComponent :title="'Invalid CloudSnips'" :text="statistics.invalidCloudSnips" />
            <StatisticComponent :title="'Deleted CloudSnips'" :text="statistics.deletedCloudSnips" />
            <StatisticComponent :title="'Total CloudSnips'" :text="statistics.totalCloudSnips" />
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
        <h3 class="text-2xl text-white font-semibold mb-4">Your CloudSnips</h3>

        <div v-if="cloudSnips.length === 0" class="text-gray-400">
          <p>No CloudSnips found. Create a new CloudSnip to get started!</p>
        </div>

        <LinkDetailComponent
          v-for="(item, index) in cloudSnips" 
          :key="index"
          style="margin-bottom: 15px"
          :cloudSnip="item"
          @updateStatus="toggleUpdateStatus(item)"
          @delete="deleteCloudSnip(index)"
          @redirect="handleRedirect"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { apiGet, apiPost, apiDelete, apiPatch } from "../utils/makeApiCall";
import NavBarComponent from '../components/NavBarComponent.vue';
import StatisticComponent from '../components/StatisticComponent.vue';
import LinkDetailComponent from '../components/LinkDetailComponent.vue';
import { useAuthStore } from "../store/auth";
import { notify } from "@kyvg/vue3-notification";


const user = ref({});


const statistics = ref([]);
const cloudSnips = ref([]);
const previewAvatar = ref(null);
const fileInput = ref(null);
const authStore = useAuthStore();


// Fetch user data
onBeforeMount(async () => {
  try {
    const userResponse = await authStore.fetchLoggedInUserDetails();
    if (userResponse.user) {
      user.value = userResponse.user;
      statistics.value = userResponse.statistics;
      const cloudSnipsResponse = await apiGet("/api/cloudsnips");
      cloudSnips.value = cloudSnipsResponse;
    } else {
      console.error('User data is not available');
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});



// Handle avatar upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Show preview
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64String = e.target.result.split(",")[1];

    previewAvatar.value = e.target.result;

    try {
      const response = await apiPost("/api/user/upload-avatar", {
        imageData: base64String,
        fileName: file.name,
        mimeType: file.type,
      });


      notify({
        title: "Avatar changed successfully.",
        text: `Your avatar has been changed successfully`,
        type: "success",
      });
      
      const getUserDetailsResponse = await authStore.fetchLoggedInUserDetails(true); // Force refresh to update the store
      user.value.avatarUrl = getUserDetailsResponse.user.avatarUrl;

    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  reader.readAsDataURL(file);
};


const toggleUpdateStatus = async (item) => {
  item.isActive = !item.isActive;

  try {
    const updateResponse = await apiPatch(`/api/cloudsnips/${item.shortCode}/status`, {
      action: item.isActive ? 'renew' : 'expire'
    });

    const getUserDetailsResponse = await authStore.fetchLoggedInUserDetails(true); // Force refresh to update the store
    statistics.value = getUserDetailsResponse.statistics;

    notify({
      title: "CloudSnip updated",
      text: `The CloudSnip status has been successfully ${item.isActive ? 'renewed' : 'expired'}.`,
      type: "success",
    });
  } catch (error) {
    console.error("Error updating CloudSnip status:", error);
    
    notify({
      title: "Error",
      text: "There was an issue updating the CloudSnip status.",
      type: "error",
    });
  }
};


const handleRedirect = (originalUrl) => {
  window.location.href = originalUrl;
}

const deleteCloudSnip = async (index) => {
  const cloudSnip = cloudSnips.value[index];
  try {
    await apiDelete(`/api/cloudsnips/${cloudSnip.shortCode}`);
    cloudSnips.value.splice(index, 1); 

    const getUserDetailsResponse = await authStore.fetchLoggedInUserDetails(true); // Force refresh to update the store
    console.log("response ", getUserDetailsResponse)

    statistics.value = getUserDetailsResponse.statistics;

    notify({
      title: "CloudSnip deleted",
      text: `CloudSnip has been successfully deleted.`,
      type: "success",
    });
  } catch (error) {
    console.error("Error deleting CloudSnip:", error);
    notify({
      title: "Error",
      text: "There was an issue deleting the CloudSnip.",
      type: "error",
    });
  }
};


</script>
