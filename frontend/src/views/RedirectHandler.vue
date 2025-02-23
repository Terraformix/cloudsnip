<template>
  <div class="min-h-screen bg-black">
    <NavBarComponent />
    <div class="min-h-screen flex items-center justify-center bg-black">
      <div class="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-700 relative">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <div v-else>
          <div class="flex justify-center mb-6">
            <div class="text-red-500 text-4xl">⚠️</div>
          </div>

          <h2 class="text-3xl font-bold text-white text-center">Error Occurred</h2>
          <p class="text-gray-400 text-center mb-6">
            {{ errorMessage }}
          </p>

          <button
            @click="goBack"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiGet } from "../utils/makeApiCall"
import NavBarComponent from "../components/NavBarComponent.vue"

const route = useRoute()
const router = useRouter()
const errorMessage = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await apiGet(`/api/cloudsnips/${route.params.shortCode}`)

    if (response.originalUrl) {
      window.location.href = response.originalUrl
      return;
    } 
    
    errorMessage.value = 'The link has expired or does not exist.'
    setTimeout(() => {
      router.push('/user-profile')
    }, 2000)
    
  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = 'The link has expired or does not exist.'
    router.push('/error')
  } finally {
    if (!errorMessage.value) return;
    loading.value = false
  }
})

const goBack = () => {
  router.push('/user-profile')
}
</script>
