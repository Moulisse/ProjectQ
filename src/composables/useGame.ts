import type { World } from '@dimforge/rapier2d'
import { Application, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export default function () {
  const world = ref<World>()
  /**
   *
   */
  function init(canvas: HTMLCanvasElement) {
    import('@dimforge/rapier2d').then(async (RAPIER) => {
      world.value = new RAPIER.World({ x: 0, y: 0 })

      // Create a new application
      const app = new Application()

      // Initialize the application
      await app.init({
        canvas,
        antialias: true,
        resizeTo: window,
      })

      // create viewport
      const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 10000,
        worldHeight: 10000,
        events: app.renderer.events,
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
        .moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)
        .clamp({
          direction: 'all',
        })

      const balls = Array.from({ length: 10 }).map(() => {
        if (!world.value)
          throw new Error('error')

        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(viewport.worldWidth / 2 + Math.random(), viewport.worldHeight / 2 + Math.random())
          .setLinearDamping(10)
        const rigidBody = world.value.createRigidBody(rigidBodyDesc)

        const colliderDesc = RAPIER.ColliderDesc.ball(10)
        world.value?.createCollider(colliderDesc, rigidBody)

        const graphic = new Graphics()
        graphic.circle(colliderDesc.translation.x, colliderDesc.translation.y, 9.5)
        graphic.fill(0xDE3249)
        viewport.addChild(graphic)

        graphic.eventMode = 'static'
        graphic.cursor = 'pointer'

        const ball = {
          rigidBody,
          graphic,
        }

        return ball
      })

      const graphic = new Graphics({
        zIndex: -1,
      })
      graphic.rect(0, 0, viewport.worldWidth, viewport.worldHeight)
      graphic.fill(0x101220)
      viewport.addChild(graphic)

      /**
       * Add physics loop
       */
      app.ticker.add(() => {
        world.value?.step()
        for (const ball of balls)
          ball.graphic.position = ball.rigidBody.translation()
      })
    })
  }

  return {
    world,
    init,
  }
}
