import type { World } from '@dimforge/rapier2d-compat'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import type { Viewport } from 'pixi-viewport'
import { Graphics } from 'pixi.js'
import { Character } from '../character/character'
import theme from '~/theme'

export class Enemy extends Character {
  generateRigidBody(world: World, x: number, y: number) {
    const rigidBodyDesc = RigidBodyDesc.dynamic()
      .setTranslation(x + Math.random() / 100, y + Math.random() / 100)
      .setLinearDamping(10)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = ColliderDesc.ball(this.size)
    world.createCollider(colliderDesc, rigidBody)

    return rigidBody
  }

  generateGraphics(viewport: Viewport) {
    const graphic = new Graphics()
    graphic.circle(0, 0, this.size - 1)
    graphic.position = {
      x: this.rigidBody.translation().x,
      y: this.rigidBody.translation().y,
    }

    graphic.fill(theme.colors.life[Math.floor(Math.random() * 4) as 0])
    viewport.addChild(graphic)

    graphic.eventMode = 'static'
    graphic.cursor = 'pointer'

    return graphic
  }
}
