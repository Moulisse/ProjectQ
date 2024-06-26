import NavMeshGenerator from 'navmesh-generator'
import NavMesh from 'navmesh'
import type { Viewport } from 'pixi-viewport'
import { Container, Graphics } from 'pixi.js'
import type { Obstacle } from './_types/Shapes'

const showNavmesh = ref(false)

export default function () {
  function generateNavMesh(viewport: Viewport, WORLD_SIZE: number, obstacles: Obstacle[]) {
    const navMeshGenerator = new NavMeshGenerator(0, 0, WORLD_SIZE, WORLD_SIZE, 3)
    const navMeshPolygons = navMeshGenerator.buildNavMesh(
      obstacles,
      5,
    )

    const navmesh = new NavMesh(navMeshPolygons)

    /**
     * Display navMesh
     */
    const navmeshContainer = new Container()
    viewport.addChild(navmeshContainer)

    watch(showNavmesh, (value) => {
      navmeshContainer.visible = value
    }, { immediate: true })

    for (const tri of navmesh.getPolygons()) {
      const face = new Graphics()
      face.poly(tri.getPoints())
      face.alpha = 0.2

      face.fill('#00ff00')

      navmeshContainer.addChild(face)

      const line = new Graphics()

      for (const point of tri.getPoints()) {
        if (tri.getPoints().indexOf(point) === 0) {
          line.moveTo(point.x, point.y)
        }
        else if (tri.getPoints().indexOf(point) === tri.getPoints().length - 1) {
          line.lineTo(point.x, point.y)
          line.lineTo(tri.getPoints()[0].x, tri.getPoints()[0].y)
        }
        else {
          line.lineTo(point.x, point.y)
        }

        const vertex = new Graphics()
        vertex.circle(point.x, point.y, 2)

        vertex.fill('#00ff00')
        navmeshContainer.addChild(vertex)
      }
      line.stroke(
        {
          color: '#00ff00',
          width: 0.1,
        },
      )
      navmeshContainer.addChild(line)
    }

    return navmesh
  }

  return {
    showNavmesh,
    generateNavMesh,
  }
}
