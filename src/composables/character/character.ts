import type { RigidBody, World } from '@dimforge/rapier2d-compat'
import type { Viewport } from 'pixi-viewport'
import type { Graphics } from 'pixi.js'
import { Point } from 'pixi.js'
import type NavMesh from 'navmesh'
import type { MaybeRef, WatchStopHandle } from 'vue'
import Vector2 from '../_types/Shapes'

export abstract class Character implements _Character {
  /**
   * The current character world position
   */
  position = ref({ x: 0, y: 0 })

  /**
   * The target world position
   */
  target = ref<{ x: number, y: number } | undefined>()

  /**
   * Path calculated by a navmesh
   */
  protected path: Vector2[] | null = null

  /**
   * Walking default speed
   */
  speed = 100

  /**
   * Rigidbody size (its graphics should match)
   */
  size = 18

  rigidBody: RigidBody
  graphic: Graphics

  generateRigidBody(..._opts: any): RigidBody {
    throw new Error('Missing implementation: generateRigidBody')
  }

  generateGraphics(..._opts: any): Graphics {
    throw new Error('Missing implementation: generateGraphics')
  }

  private setFollowWatcher: WatchStopHandle | undefined
  /**
   * Find the closest point in the target and set it as the target
   */
  setFollow(navMesh: NavMesh, point?: MaybeRef<{ x: number, y: number }>) {
    this.setFollowWatcher?.()
    if (!point)
      return
    if (isRef(point)) {
      this.setFollowWatcher = watch(point, (p) => {
        const navPoint = navMesh.findClosestMeshPoint(new Vector2(p.x, p.y)).point
        this.target.value = new Point(navPoint?.x, navPoint?.y)
      }, { immediate: true })
    }
    else {
      const navPoint = navMesh.findClosestMeshPoint(new Vector2(point.x, point.y)).point
      this.target.value = new Point(navPoint?.x, navPoint?.y)
    }
  }

  /**
   *
   */
  setPath(navMesh: NavMesh) {
    if (!this.target.value) {
      this.path = null
      return
    }
    const from = navMesh.findClosestMeshPoint(new Vector2(this.rigidBody.translation().x, this.rigidBody.translation().y)).point
    const to = navMesh.findClosestMeshPoint(new Vector2(this.target.value.x, this.target.value.y)).point
    if (!from || !to)
      return
    this.path = navMesh.findPath(from, to) || this.path
  }

  /**
   *
   */
  move() {
    if (!this.target.value || !this.path)
      return
    const nextWaypoint = this.path[1]
    if (!nextWaypoint)
      return

    const direction = new Point(nextWaypoint.x, nextWaypoint.y).subtract(this.rigidBody.translation())

    // speed should decrease when approaching the follow target
    const approachSpeed = this.path.indexOf(nextWaypoint) === this.path.length - 1
      ? Math.min(this.speed, direction.magnitude() * this.speed ** (1 / 3))
      : this.speed

    if (direction.magnitude() > 1)
      this.rigidBody.setLinvel(direction.normalize().multiply({ x: approachSpeed, y: approachSpeed }), true)
  }

  constructor(world: World, viewport: Viewport, props: {
    x: number
    y: number
    speed?: number
    size?: number
  }) {
    this.position.value = { x: props.x, y: props.y }
    this.speed = props.speed || this.speed
    this.size = props.size || this.size

    this.rigidBody = this.generateRigidBody(world, props.x, props.y)
    this.graphic = this.generateGraphics(viewport)

    watch(this.position, () => {
      this.graphic.position = {
        x: this.rigidBody.translation().x,
        y: this.rigidBody.translation().y,
      }
    })
  }
}

export interface _Character {
  generateRigidBody: (world: World, x: number, y: number) => RigidBody
}
