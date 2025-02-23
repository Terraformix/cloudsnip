<template>
    <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
        <p class="text-gray-400 text-sm">{{title}}</p>
        <p class="text-white text-2xl font-bold">{{text}}</p>
    </div>
</template>

<script setup>

defineProps({
    title: String,
    text: String
})

</script>