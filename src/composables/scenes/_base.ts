import { ColliderDesc, type RigidBody, RigidBodyDesc, type World } from '@dimforge/rapier2d-compat'
import { Viewport } from 'pixi-viewport'
import type { Application } from 'pixi.js'
import { Graphics } from 'pixi.js'
import { NavMeshGenerator } from 'navmesh-generator'
import { NavMesh } from 'navmesh'

type Shape = { x: number, y: number } []
type ObstacleTypes = 'polyligne' | 'convexHull'
interface ObstacleData { type: ObstacleTypes, shape: Shape }

export class Scene {
  WORLD_SIZE = 2000

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
      type: 'convexHull' as ObstacleTypes,
      shape: [
        { x: this.WORLD_SIZE * (0.29 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.3 },
        { x: this.WORLD_SIZE * (0.31 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.3 },
        { x: this.WORLD_SIZE * (0.31 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.35 },
        { x: this.WORLD_SIZE * (0.29 + 0.4 * i / 10), y: this.WORLD_SIZE * 0.35 },
      ],
    })),
  ]

  obstacles: {
    shape: Shape
    rigidBody: RigidBody
    graphic: Graphics
  }[]

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
        maxWidth: 1500,
        maxHeight: 1500,
      })
      .fit()
      .moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2)

    // adds world background
    const graphic = new Graphics({
      zIndex: -1,
    })
    graphic.rect(0, 0, viewport.worldWidth, viewport.worldHeight)
    graphic.fill('#101220')
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

    graphic.fill('#56b8d0')
    this.viewport.addChild(graphic)

    return graphic
  }

  private generateNavMesh() {
    const navMeshGenerator = new NavMeshGenerator(0, 0, this.WORLD_SIZE, this.WORLD_SIZE, 3)

    const navMeshPolygons = navMeshGenerator.buildNavMesh(
      this.obstaclesData.map(obs => obs.shape),
      5,
    )

    return new NavMesh(navMeshPolygons)
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
    this.navMesh = this.generateNavMesh()

    // Display navMesh
    // for (const tri of this.navMesh.getPolygons()) {
    //   const face = new Graphics()
    //   face.poly(tri.getPoints())

    //   face.fill('#00ff0040')
    //   this.viewport.addChild(face)

    //   const line = new Graphics()

    //   for (const point of tri.getPoints()) {
    //     if (tri.getPoints().indexOf(point) === 0)
    //       line.moveTo(point.x, point.y)
    //     else
    //       line.lineTo(point.x, point.y)

    //     const vertex = new Graphics()
    //     vertex.circle(point.x, point.y, 5)

    //     vertex.fill('#00ff00')
    //     this.viewport.addChild(vertex)
    //   }
    //   line.stroke('#00ff00')
    //   this.viewport.addChild(line)
    // }
  }
}
