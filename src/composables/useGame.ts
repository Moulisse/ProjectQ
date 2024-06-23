import type { World } from '@dimforge/rapier2d'
import { Application } from 'pixi.js'
import { EDot } from './enemies/dot'
import type { Enemy } from './enemies/_base'
import { Scene } from './scenes/_base'

export const useGameStore = defineStore('game', () => {
  let world: World
  let app: Application

  let currentEnemies: Enemy[] = []

  /**
   *
   */
  function init(canvas: HTMLCanvasElement) {
    import('@dimforge/rapier2d').then(async (RAPIER) => {
      world = new RAPIER.World({ x: 0, y: 0 })

      // Create a new application
      app = new Application()

      // Initialize the application
      await app.init({
        canvas,
        antialias: true,
        resizeTo: window,
      })

      const scene = new Scene(world, app)

      scene.viewport.on('mousemove', (e) => {
        for (const enemy of currentEnemies)
          enemy.setFollow(scene.navMesh, scene.viewport.toLocal(e.global))
      })

      /**
       * Add physics loop
       */
      app.ticker.add(() => {
        for (const enemy of currentEnemies) {
          enemy.setPath(scene.navMesh)

          enemy.move()
        }

        world.step()

        for (const enemy of currentEnemies) {
          enemy.graphic.position = {
            x: enemy.rigidBody.translation().x,
            y: enemy.rigidBody.translation().y,
          }
        }
      })

      startWave(scene)
    })
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
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
