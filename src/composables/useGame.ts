import * as PIXI from 'pixi.js'
import type { World } from '@dimforge/rapier2d-compat'
import RAPIER from '@dimforge/rapier2d-compat'
import 'pixi.js/events'
import { EDot } from './enemies/dot'
import type { Enemy } from './enemies/_base'
import { Scene } from './scenes/_base'

let world: World
let app: PIXI.Application

// let scene: Scene | undefined
const scene = shallowRef<Scene | undefined>()

let currentEnemies: Enemy[] = []

export function useGameStore() {
  /**
   *
   */
  async function init(canvas: HTMLCanvasElement) {
    await RAPIER.init()

    world = new RAPIER.World({ x: 0, y: 0 })

    // Create a new application
    app = new PIXI.Application()

    // Initialize the application
    await app.init({
      canvas,
      antialias: true,
      resizeTo: window,
      autoDensity: true,
    })

    scene.value = new Scene(world, app)

    scene.value.viewport.on('pointermove', (e) => {
      if (!scene.value)
        return
      for (const enemy of currentEnemies)
        enemy.setFollow(scene.value.navMesh, scene.value.viewport.toLocal(e.global))
    })

    /**
     * Add physics loop
     */
    app.ticker.add(() => {
      for (const enemy of currentEnemies) {
        if (!scene.value)
          return
        enemy.setPath(scene.value.navMesh)

        enemy.move()
      }

      world.step()

      for (const enemy of currentEnemies) {
        enemy.graphic.position = {
          x: enemy.rigidBody.translation().x,
          y: enemy.rigidBody.translation().y,
        }
      }
      app.render()
    })

    startWave(scene.value)
  }

  function startWave(scene: Scene) {
    currentEnemies = [
      ...Array.from({ length: 1 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 - 250, scene.viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 - 250, scene.viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 - 250, scene.viewport.worldHeight / 2 + 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 + 250, scene.viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 + 250, scene.viewport.worldHeight / 2 + 200),
      ),
    ]
  }
  return {
    init,
    scene,
  }
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
