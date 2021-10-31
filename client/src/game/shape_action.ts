import type { Shape } from "./shape";

export enum ShapeActionName {
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_DOWN,
  ROTATE,
}

export type ShapeAction = (shape: Shape) => void;

export const SHAPE_ACTIONS: { [ShapeActionName: string]: ShapeAction } = {
  [ShapeActionName.MOVE_LEFT]: (shape: Shape) => {
    shape.posX--;
  },
  [ShapeActionName.MOVE_RIGHT]: (shape: Shape) => {
    shape.posX++;
  },
  [ShapeActionName.MOVE_DOWN]: (shape: Shape) => {
    shape.posY++;
  },
  [ShapeActionName.ROTATE]: (shape: Shape) => {
    const type: number[][] = [];
    const cols = shape.type[0].length;
    const rows = shape.type.length;
    for (let x = 0; x < cols; ++x) {
      type[x] = [];
      for (let y = 0; y < rows; ++y) {
        type[x][y] = shape.type[rows - 1 - y][x];
      }
    }
    shape.type = type;
  },
};
