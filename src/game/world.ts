import { WORLD_W } from './config';
import type { Player } from './player'
import type { Renderer } from './renderer'
import { createRandomShape, Shape } from './shape';
import { SHAPE_ACTIONS } from './shape_action';
import { SHAPE_TYPES } from './shape_type';

export interface GameWorld {
    destroy: () => void
}

export const createGameWorld = (players: Player[], renderer: Renderer): GameWorld => {
    let nextShapeId: number = 1;
    const playerShapes: Shape[][] = players.map(() => [])
    const timers: any[] = [];

    const addShape = (id: number) => {
        const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
        const color = players[id].color
        const posX = Math.floor(((WORLD_W - 2) / players.length / 2) * (id * 2 + 1) - 1)
        const posY = 0
        const shape = createRandomShape(nextShapeId++, type, color, posX, posY)
        playerShapes[id].unshift(shape)
        renderer.insertShape(shape)
    }

    const handleAction = (id: number, action: string) => {
        const shape = playerShapes[id][0]
        SHAPE_ACTIONS[action](shape)
        renderer.updateShape(shape)
    }

    const setupWorld = () => {
        for (let i = 0; i < players.length; ++i) {
            addShape(i)
            players[i].listen(action => handleAction(i, action))
            timers[i] = setInterval(() => handleAction(i, 'MOVE_DOWN'), 1000)
        }
    }

    const destroy = () => {
        for (let i = 0; i < players.length; ++i) {
            players[i].destroy()
            clearInterval(timers[i])
        }
    }

    // init !
    setupWorld()

    return {
        destroy
    }
}
