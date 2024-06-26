import * as PIXI from 'pixi.js'
import type { World } from '@dimforge/rapier2d-compat'
import RAPIER from '@dimforge/rapier2d-compat'
import 'pixi.js/events'
import { EDot } from './enemies/dot'
import type { Enemy } from './enemies/_base'
import { Scene } from './scenes/_base'
import { Player } from './player'

let world: World
let app: PIXI.Application

// let scene: Scene | undefined
const scene = shallowRef<Scene | undefined>()

let currentEnemies: Enemy[] = []

const player = shallowRef<Player | undefined>()

export default function () {
  /**
   * Create the world, the app, the scene, and start the game
   */
  async function init(canvas: HTMLCanvasElement) {
    await RAPIER.init()

    world = new RAPIER.World({ x: 0, y: 0 })

    // Create a new application
    app = new PIXI.Application()

    // Initialize the application
    await app.init({
      canvas,
      antialias: true,
      resizeTo: window,
      autoDensity: true,
    })

    scene.value = new Scene(world, app)

    scene.value.viewport.on('pointerdown', (e) => {
      if (!player.value || !scene.value || e.button !== 2)
        return
      player.value.setFollow(scene.value.navMesh, scene.value.viewport.toLocal(e.global))
    })

    player.value = new Player(world, scene.value.viewport, scene.value.viewport.worldWidth / 2 - 1200, scene.value.viewport.worldHeight / 2)
    setTimeout(() => scene.value?.viewport.animate({
      scale: 1.5,
      position: {
        x: 0,
        y: scene.value.viewport.worldHeight / 2,
      },
      time: 1500,
      ease: 'easeOutSine',
    }))

    /**
     * Add physics loop
     */
    app.ticker.add(() => {
      for (const enemy of currentEnemies) {
        if (!scene.value)
          return
        enemy.setPath(scene.value.navMesh)
        enemy.move()
      }

      if (player.value && scene.value) {
        player.value.setPath(scene.value.navMesh)
        player.value.move()
      }
      world.step()

      for (const enemy of currentEnemies) {
        enemy.position.value = {
          x: enemy.rigidBody.translation().x,
          y: enemy.rigidBody.translation().y,
        }
      }
      if (player.value && scene.value) {
        player.value.position.value = {
          x: player.value.rigidBody.translation().x,
          y: player.value.rigidBody.translation().y,
        }
      }

      app.render()
    })

    startWave(scene.value)

    for (const enemy of currentEnemies)
      enemy.setFollow(scene.value.navMesh, player.value.position)
  }

  function startWave(scene: Scene) {
    currentEnemies = [
      ...Array.from({ length: 1 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 - 250, scene.viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 - 250, scene.viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 - 250, scene.viewport.worldHeight / 2 + 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 + 250, scene.viewport.worldHeight / 2 - 200),
      ),
      ...Array.from({ length: 50 }).map(() =>
        new EDot(world, scene.viewport, scene.viewport.worldWidth / 2 + 250, scene.viewport.worldHeight / 2 + 200),
      ),
    ]
  }
  return {
    init,
    scene,
    player,
  }
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
