import { ColliderDesc, RigidBodyDesc, type World } from '@dimforge/rapier2d'
import type { Point } from 'pixi.js'
import { Application, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { EDot } from './enemies/dot'
import type { Enemy } from './enemies/_base'

const WORLD_SIZE = 4000

export default function () {
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
          for (const enemy of currentEnemies)
            enemy.rigidBody.setLinvel(flag.subtract(enemy.graphic.position).normalize().multiply({ x: 250, y: 250 }), true)
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
    const x = viewport.worldWidth / 2
    const y = viewport.worldHeight / 2

    const shape = [
      { x: 100, y: 0 },
      { x: 500, y: 0 },
      { x: 0, y: 500 },
    ]

    const shapeC = new Float32Array(shape.map(point => Object.values(point)).flat())

    const rigidBodyDesc = RigidBodyDesc.fixed()
      .setTranslation(x, y)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = ColliderDesc.convexHull(shapeC)
    if (colliderDesc)
      world.createCollider(colliderDesc, rigidBody)

    const graphic = new Graphics()
    graphic.poly(shape)
    graphic.position = {
      x: rigidBody.translation().x,
      y: rigidBody.translation().y,
    }

    graphic.fill('#56b8d0')
    viewport.addChild(graphic)
  }

  function startWave() {
    currentEnemies = [
      ...Array.from({ length: 2 }).map(() =>
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
}
