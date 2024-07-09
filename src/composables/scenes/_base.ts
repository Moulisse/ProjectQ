import { ColliderDesc, type RigidBody, RigidBodyDesc, type World } from '@dimforge/rapier2d-compat'
import { Viewport } from 'pixi-viewport'
import type { Application } from 'pixi.js'
import { Graphics, Point } from 'pixi.js'
import type NavMesh from 'navmesh'
import type { Obstacle, ObstacleData } from '../_types/Shapes'
import theme from '~/theme'

const { generateNavMesh } = useNavmesh()

export class Scene {
  WORLD_SIZE = 3000

  viewport: Viewport
  navMesh: NavMesh

  protected ring = {
    nbPoints: 64,
    radius: this.WORLD_SIZE * 0.45,
    margin: 1000,
  }

  protected obstaclesData: ObstacleData[] = [
    {
      type: 'polyligne',
      shape: [
        { x: -this.ring.margin, y: -this.ring.margin },
        { x: this.WORLD_SIZE + this.ring.margin, y: -this.ring.margin },
        { x: this.WORLD_SIZE + this.ring.margin, y: this.WORLD_SIZE / 2 },
        ...Array.from({ length: this.ring.nbPoints + 1 }).map((_v, i) => ({
          x: this.WORLD_SIZE / 2 + Math.cos(-2 * Math.PI * i / this.ring.nbPoints) * this.ring.radius,
          y: this.WORLD_SIZE / 2 + Math.sin(-2 * Math.PI * i / this.ring.nbPoints) * this.ring.radius,
        })),
        { x: this.WORLD_SIZE + this.ring.margin, y: this.WORLD_SIZE / 2 },
        { x: this.WORLD_SIZE + this.ring.margin, y: this.WORLD_SIZE + this.ring.margin },
        { x: -this.ring.margin, y: this.WORLD_SIZE + this.ring.margin },
      ],
    },
    {
      type: 'convexHull',
      shape: [
        { x: this.WORLD_SIZE * 0.4, y: this.WORLD_SIZE * 0.7 },
        { x: this.WORLD_SIZE * 0.6, y: this.WORLD_SIZE * 0.7 },
        { x: this.WORLD_SIZE * 0.6, y: this.WORLD_SIZE * 0.65 },
        { x: this.WORLD_SIZE * 0.4, y: this.WORLD_SIZE * 0.65 },
      ],
    },
    {
      type: 'convexHull',
      shape: [
        { x: this.WORLD_SIZE * 0.45, y: this.WORLD_SIZE * 0.55 },
        { x: this.WORLD_SIZE * 0.55, y: this.WORLD_SIZE * 0.55 },
        { x: this.WORLD_SIZE * 0.8, y: this.WORLD_SIZE * 0.5 },
        { x: this.WORLD_SIZE * 0.55, y: this.WORLD_SIZE * 0.45 },
        { x: this.WORLD_SIZE * 0.45, y: this.WORLD_SIZE * 0.45 },
        { x: this.WORLD_SIZE * 0.2, y: this.WORLD_SIZE * 0.5 },
      ],
    },
    ...Array.from({ length: 10 }).map((_v, i) => ({
      type: 'convexHull' as const,
      shape: [
        { x: this.WORLD_SIZE * (0.29 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.3 },
        { x: this.WORLD_SIZE * (0.31 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.3 },
        { x: this.WORLD_SIZE * (0.31 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.35 },
        { x: this.WORLD_SIZE * (0.29 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.35 },
      ],
    })),
  ]

  obstacles: {
    shape: Obstacle
    rigidBody: RigidBody
    graphic: Graphics
  }[]

  pointer = ref(new Point())

  /**
   * Init Viewport
   * @param app
   */
  private init(app: Application) {
    // create viewport
    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: this.WORLD_SIZE,
      worldHeight: this.WORLD_SIZE,
      events: app.renderer.events,
      disableOnContextMenu: true,
    })

    viewport.on('pointermove', (e) => {
      this.pointer.value = viewport.toLocal(e.global)
    })

    // add the viewport to the stage
    app.stage.addChild(viewport)

    // activate plugins
    viewport
      .drag({
        mouseButtons: 'left',
      })
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
        maxWidth: this.WORLD_SIZE,
        maxHeight: this.WORLD_SIZE,
      })
      .fit()
      .moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)

    // adds world background
    const graphic = new Graphics({
      zIndex: -1,
    })
    graphic.rect(0, 0, viewport.worldWidth, viewport.worldHeight)
    graphic.fill(theme.colors.neutral.back)
    viewport.addChild(graphic)

    return viewport
  }

  /**
   *
   */
  private generateRigidBody(data: ObstacleData, world: World) {
    const shapeC = new Float32Array(data.shape.map(point => Object.values(point)).flat())

    const rigidBodyDesc = RigidBodyDesc.fixed()
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = data.type === 'polyligne'
      ? ColliderDesc.polyline(shapeC)
      : ColliderDesc.convexHull(shapeC)
    if (colliderDesc)
      world.createCollider(colliderDesc, rigidBody)

    return rigidBody
  }

  /**
   *
   */
  private generateGraphics(data: ObstacleData) {
    const graphic = new Graphics()
    graphic.poly(data.shape)
    graphic.fill(theme.colors.neutral.front)
    this.viewport.addChild(graphic)

    return graphic
  }

  /**
   * Initialize viewport and generate obstacle
   * @param world
   * @param app
   */
  constructor(world: World, app: Application) {
    this.viewport = this.init(app)
    this.obstacles = this.obstaclesData.map(obstacle => ({
      shape: obstacle.shape,
      rigidBody: this.generateRigidBody(obstacle, world),
      graphic: this.generateGraphics(obstacle),
    }))
    this.navMesh = generateNavMesh(this.viewport, this.WORLD_SIZE, this.obstaclesData.map(obs => obs.shape))
  }
}
