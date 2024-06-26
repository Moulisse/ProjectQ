import type { RigidBody, World } from '@dimforge/rapier2d-compat'
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import type { NavMesh } from 'navmesh'
import type { Viewport } from 'pixi-viewport'
import { Graphics, Point } from 'pixi.js'
import Vector2 from '../_types/Shapes'
import theme from '~/theme'

export class Enemy {
  rigidBody: RigidBody
  graphic: Graphics

  protected follow: Point | null = null
  private path: Vector2[] | null = null

  private speed = 100
  private size = 18

  /**
   *
   */
  generateRigidBody(world: World, x: number, y: number) {
    const rigidBodyDesc = RigidBodyDesc.dynamic()
      .setTranslation(x + Math.random() / 100, y + Math.random() / 100)
      .setLinearDamping(10)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = ColliderDesc.ball(this.size)
    world.createCollider(colliderDesc, rigidBody)

    return rigidBody
  }

  /**
   *
   */
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

  setFollow(navMesh: NavMesh, point: { x: number, y: number }) {
    const navPoint = navMesh.findClosestMeshPoint(new Vector2(point.x, point.y)).point
    this.follow = new Point(navPoint?.x, navPoint?.y)
  }

  /**
   *
   */
  setPath(navMesh: NavMesh) {
    if (!this.follow) {
      this.path = null
      return
    }
    const from = navMesh.findClosestMeshPoint(new Vector2(this.rigidBody.translation().x, this.rigidBody.translation().y)).point
    const to = navMesh.findClosestMeshPoint(new Vector2(this.follow.x, this.follow.y)).point
    if (!from || !to)
      return
    this.path = navMesh.findPath(from, to) || this.path
  }

  /**
   *
   */
  move() {
    if (!this.follow || !this.path)
      return
    const target = this.path[1]
    if (!target)
      return

    const direction = new Point(target.x, target.y).subtract(this.rigidBody.translation())

    // speed should decrease when approaching the follow target
    const approachSpeed = this.path.indexOf(target) === this.path.length - 1
      ? Math.min(this.speed, direction.magnitude() * this.speed ** (1 / 3))
      : this.speed

    if (direction.magnitude() > 1)
      this.rigidBody.setLinvel(direction.normalize().multiply({ x: approachSpeed, y: approachSpeed }), true)
  }

  constructor(world: World, viewport: Viewport, x: number, y: number) {
    this.rigidBody = this.generateRigidBody(world, x, y)
    this.graphic = this.generateGraphics(viewport)
  }
}
