<script setup lang="ts">
const { init } = useGame()

const canvas = ref()
onMounted(() => init(canvas.value))
</script>

<template>
  <canvas ref="canvas" />
</template>
