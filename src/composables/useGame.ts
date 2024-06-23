import type { World } from '@dimforge/rapier2d'
import type { Point } from 'pixi.js'
import { Application, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { EDot } from './enemies/dot'
import type { Enemy } from './enemies/_base'
import { Scene } from './scenes/_base'

const WORLD_SIZE = 4000

export const useGameStore = defineStore('game', () => {
  let world: World
  let app: Application
  let viewport: Viewport

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

      // create viewport
      viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: WORLD_SIZE,
        worldHeight: WORLD_SIZE,
        events: app.renderer.events,
        disableOnContextMenu: true,
      })

      let flag: Point

      viewport.on('mousemove', (e) => {
        flag = viewport.toLocal(e.global)
      })

      // add the viewport to the stage
      app.stage.addChild(viewport)

      // activate plugins
      viewport
        .drag()
        .pinch()
        .wheel({
          percent: 2,
          smooth: 20,
        })
        .decelerate({
          friction: 0.93,
        })
        .clamp({
          direction: 'all',
        })
        .clampZoom({
          minWidth: 100,
          minHeight: 100,
          maxWidth: WORLD_SIZE / 2,
          maxHeight: WORLD_SIZE / 2,
        })
        .fit()
        .moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)

      const graphic = new Graphics({
        zIndex: -1,
      })
      graphic.rect(0, 0, viewport.worldWidth, viewport.worldHeight)
      graphic.fill('#101220')
      viewport.addChild(graphic)

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

      loadScene()

      startWave()
    })
  }

  function loadScene() {
    // eslint-disable-next-line no-new
    new Scene(world, viewport, viewport.worldWidth / 2, viewport.worldHeight / 2)
  }

  function startWave() {
    currentEnemies = [
      ...Array.from({ length: 1 }).map(() =>
        new EDot(world, viewport, viewport.worldWidth / 2 - 250, viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, viewport, viewport.worldWidth / 2 - 250, viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, viewport, viewport.worldWidth / 2 - 250, viewport.worldHeight / 2 + 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, viewport, viewport.worldWidth / 2 + 250, viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, viewport, viewport.worldWidth / 2 + 250, viewport.worldHeight / 2 + 200),
      ),
    ]
  }
  return {
    init,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
