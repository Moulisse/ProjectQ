import type { World } from '@dimforge/rapier2d'
import { Application, Graphics } from 'pixi.js'

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

      app.stage.eventMode = 'static'
      app.stage.hitArea = app.screen
      app.stage.on('pointerup', onDragEnd)
      app.stage.on('pointerupoutside', onDragEnd)

      const balls = Array.from({ length: 500 }).map(() => {
        if (!world.value)
          throw new Error('error')

        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(window.innerWidth / 2 + Math.random(), window.innerHeight / 2 + Math.random())
          .setLinearDamping(10)
        const rigidBody = world.value.createRigidBody(rigidBodyDesc)

        const colliderDesc = RAPIER.ColliderDesc.ball(50)
        world.value?.createCollider(colliderDesc, rigidBody)

        const graphic = new Graphics()
        graphic.circle(colliderDesc.translation.x, colliderDesc.translation.y, 48)
        graphic.fill(0xDE3249)
        app.stage.addChild(graphic)

        graphic.eventMode = 'static'
        graphic.cursor = 'pointer'

        const ball = {
          rigidBody,
          graphic,
        }
        graphic.on('pointerdown', () => onDragStart(ball))

        return ball
      })

      let dragTarget: typeof balls[number] | null

      function onDragMove(event: any) {
        if (dragTarget) {
          dragTarget.graphic.parent.toLocal(event.global, undefined, dragTarget.graphic.position)
          dragTarget.rigidBody.setTranslation(event.global, true)
        }
      }

      function onDragStart(ball: typeof balls[number]) {
        dragTarget = ball
        app.stage.on('pointermove', onDragMove)
      }

      function onDragEnd() {
        if (dragTarget) {
          app.stage.off('pointermove', onDragMove)
          dragTarget = null
        }
      }

      function update() {
        world.value?.step()

        for (const ball of balls)
          ball.graphic.position = ball.rigidBody.translation()

        requestAnimationFrame(update)
      }

      requestAnimationFrame(update)
    })
  }

  return {
    world,
    init,
  }
}
