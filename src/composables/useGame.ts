import type { World } from '@dimforge/rapier2d'
import type { Point } from 'pixi.js'
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

      let flag: Point

      scene.viewport.on('mousemove', (e) => {
        flag = scene.viewport.toLocal(e.global)
      })

      /**
       * Add physics loop
       */
      app.ticker.add(() => {
        if (flag) {
          for (const enemy of currentEnemies) {
            const direction = flag.subtract(enemy.graphic.position)
            const speed = 250
            const approachSpeed = Math.min(speed, direction.magnitude() * speed ** (1 / 3))

            if (direction.magnitude() > 1)
              enemy.rigidBody.setLinvel(direction.normalize().multiply({ x: approachSpeed, y: approachSpeed }), true)
          }
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
