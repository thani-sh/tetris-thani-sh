import type { Shape } from './shape'

export type ShapeAction = (shape: Shape) => void

export const SHAPE_ACTIONS: { [key: string]: ShapeAction } = {
    MOVE_LEFT: (shape: Shape) => {
        shape.posX--
    },
    MOVE_RIGHT: (shape: Shape) => {
        shape.posX++
    },
    MOVE_DOWN: (shape: Shape) => {
        shape.posY++
    },
    ROTATE: (shape: Shape) => {
        const dots: number[][] = [];
        const cols = shape.type.dots[0].length
        const rows = shape.type.dots.length
        for (let x = 0; x < cols; ++x) {
          dots[x] = [];
          for (let y = 0; y < rows; ++y) {
            dots[x][y] = shape.type.dots[rows - 1 - y][x];
          }
        }
        shape.type.dots = dots;
    },
}
