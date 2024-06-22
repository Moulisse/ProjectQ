import { ColliderDesc, type RigidBody, RigidBodyDesc, type World } from '@dimforge/rapier2d'
import type { Viewport } from 'pixi-viewport'
import { Graphics } from 'pixi.js'

export class Enemy {
  rigidBody: RigidBody
  graphic: Graphics

  generateRigidBody(world: World, x: number, y: number) {
    const rigidBodyDesc = RigidBodyDesc.dynamic()
      .setTranslation(x + Math.random() / 100, y + Math.random() / 100)
      .setLinearDamping(10)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = ColliderDesc.ball(10)
    world.createCollider(colliderDesc, rigidBody)

    return rigidBody
  }

  generateGraphics(viewport: Viewport) {
    const graphic = new Graphics()
    graphic.circle(0, 0, 9.5)
    graphic.position = {
      x: this.rigidBody.translation().x,
      y: this.rigidBody.translation().y,
    }

    graphic.fill(0xDE3249)
    viewport.addChild(graphic)

    graphic.eventMode = 'static'
    graphic.cursor = 'pointer'

    return graphic
  }

  constructor(world: World, viewport: Viewport, x: number, y: number) {
    this.rigidBody = this.generateRigidBody(world, x, y)
    this.graphic = this.generateGraphics(viewport)
  }
}
