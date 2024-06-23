import { ColliderDesc, type RigidBody, RigidBodyDesc, type World } from '@dimforge/rapier2d'
import type { Viewport } from 'pixi-viewport'
import { Graphics } from 'pixi.js'

export class Scene {
  rigidBody: RigidBody
  graphic: Graphics

  shape = [
    { x: 100, y: 0 },
    { x: 500, y: 0 },
    { x: 0, y: 500 },
  ]

  generateRigidBody(world: World, x: number, y: number) {
    const shapeC = new Float32Array(this.shape.map(point => Object.values(point)).flat())

    const rigidBodyDesc = RigidBodyDesc.fixed()
      .setTranslation(x, y)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = ColliderDesc.convexHull(shapeC)
    if (colliderDesc)
      world.createCollider(colliderDesc, rigidBody)

    return rigidBody
  }

  generateGraphics(viewport: Viewport) {
    const graphic = new Graphics()
    graphic.poly(this.shape)
    graphic.position = {
      x: this.rigidBody.translation().x,
      y: this.rigidBody.translation().y,
    }

    graphic.fill('#56b8d0')
    viewport.addChild(graphic)

    return graphic
  }

  constructor(world: World, viewport: Viewport, x: number, y: number) {
    this.rigidBody = this.generateRigidBody(world, x, y)
    this.graphic = this.generateGraphics(viewport)
  }
}
