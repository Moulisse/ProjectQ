<script setup lang="ts">
const { init } = useGameStore()

const canvas = ref()
onMounted(() => init(canvas.value))
</script>

<template>
  <Debug />
  <canvas ref="canvas" />
</template>
