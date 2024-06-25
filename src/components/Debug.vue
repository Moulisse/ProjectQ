<script setup lang=ts>
const useGame = useGameStore()
</script>

<template>
  <div class="fixed min-w-xs bg-black/80 p-1">
    <template v-if="useGame.scene.value">
      <p>
        Pointer x: {{ usePrecision(useGame.scene.value.pointer.value.x, 0) }}
      </p>
      <p>
        Pointer y: {{ usePrecision(useGame.scene.value.pointer.value.y, 0) }}
      </p>
      <button @click="useGame.scene.value.showNavmesh.value = !useGame.scene.value.showNavmesh.value">
        > Toggle nav mesh
      </button>
    </template>
  </div>
</template>
