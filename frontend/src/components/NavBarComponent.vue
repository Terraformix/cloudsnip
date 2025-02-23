<template>
  <nav class="border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <RouterLink to="/">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-white">Cloud<span class="text-blue-500">Snip</span></h1>
        </div>
      </RouterLink>

      <div class="flex items-center gap-4">
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/user-profile">
            <button class="text-white border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800">
              Profile
            </button>
          </RouterLink>

          <button 
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            @click="logoutUser"
          >
            Logout
          </button>
        </template>

        <template v-else>
          <RouterLink to="/login">
            <button class="text-white border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800">
              Sign In
            </button>
          </RouterLink>

          <RouterLink to="/register">
            <button class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition">
              Register
            </button>
          </RouterLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const router = useRouter();

const logoutUser = () => {
  authStore.logout();
  authStore.clearLoggedInUserDetails();
  router.push("/login")
};
</script>
