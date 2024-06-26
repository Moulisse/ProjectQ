<script setup lang=ts>
const { scene, player } = useGame()
const { showNavmesh } = useNavmesh()
</script>

<template>
  <div class="fixed min-w-xs bg-black/80 p-1">
    <template v-if="scene">
      <p>
        Pointer x: {{ usePrecision(scene.pointer.value.x, 0) }}
      </p>
      <p>
        Pointer y: {{ usePrecision(scene.pointer.value.y, 0) }}
      </p>
      <button @click="showNavmesh = !showNavmesh">
        > Toggle nav mesh
      </button>
      <hr>
      <p>
        Camera x: {{ usePrecision(scene.viewport.position.x / scene.viewport.scale.x, 2) }}
      </p>
      <p>
        Camera y: {{ usePrecision(scene.viewport.position.y / scene.viewport.scale.y, 2) }}
      </p>
      <p>
        Camera zoom: {{ usePrecision(scene.viewport.scale.x, 2) }}
      </p>
    </template>
    <template v-if="player">
      <hr>
      <p>
        Player x: {{ usePrecision(player.position.value.x, 0) }}
      </p>
      <p>
        Player y: {{ usePrecision(player.position.value.y, 0) }}
      </p>
    </template>
  </div>
</template>
