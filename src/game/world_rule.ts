import type { Shape } from "./shape";
import { WORLD_ACTION } from "./world_action";
import { ShapeActionName } from "./shape_action";
import { WORLD_H, WORLD_W } from "./config";

export interface WorldRuleParams {
  shape: Shape;
  sim: Shape;
  shapes: Shape[][];
  action: ShapeActionName;
}

export type WorldRule = (params: WorldRuleParams) => WORLD_ACTION | null;

const doesBBoxOverlap = (s1: Shape, s2: Shape) => {
  if (
    s1.posX > s2.posX + s2.type[0].length ||
    s1.posX + s1.type[0].length < s2.posX ||
    s1.posY > s2.posY + s2.type.length ||
    s1.posY + s1.type.length < s2.posY
  ) {
    return false;
  }
  return true;
};

const doesBlockOverlap = (s1: Shape, row: number, col: number, s2: Shape) => {
  if (!s1.type[row][col]) {
    return false;
  }
  const s2row = row + s1.posY - s2.posY;
  const s2col = col + s1.posX - s2.posX;
  if (s2.type[s2row] && s2.type[s2row][s2col]) {
    return true;
  }
  return false;
};

const getOtherShapes = function* (
  shape: Shape,
  shapes: Shape[][]
): Generator<[Shape, boolean]> {
  for (let i = 0; i < shapes.length; ++i) {
    for (let j = 0; j < shapes[i].length; ++j) {
      if (shapes[i][j] === shape) {
        continue;
      }
      yield [shapes[i][j], j === 0];
    }
  }
};

export const createWorldRules = (): WorldRule[] => {
  const isBlockedFromLeft = (params: WorldRuleParams): WORLD_ACTION | null => {
    if (params.action !== ShapeActionName.MOVE_LEFT) {
      return null;
    }
    if (params.sim.posX < 0) {
      return WORLD_ACTION.BLOCK_SHAPE_ACTION;
    }
    for (let [shape] of getOtherShapes(params.shape, params.shapes)) {
      if (!doesBBoxOverlap(params.sim, shape)) {
        continue;
      }
      const col = 0;
      for (let row = 0; row < params.sim.type.length; ++row) {
        if (doesBlockOverlap(params.sim, row, col, shape)) {
          return WORLD_ACTION.BLOCK_SHAPE_ACTION;
        }
      }
    }
    return null;
  };

  const isBlockedFromRight = (params: WorldRuleParams): WORLD_ACTION | null => {
    if (params.action !== ShapeActionName.MOVE_RIGHT) {
      return null;
    }
    if (params.sim.posX + params.sim.type[0].length > WORLD_W) {
      return WORLD_ACTION.BLOCK_SHAPE_ACTION;
    }
    for (let [shape] of getOtherShapes(params.shape, params.shapes)) {
      if (!doesBBoxOverlap(params.sim, shape)) {
        continue;
      }
      const col = params.sim.type[0].length - 1;
      for (let row = 0; row < params.sim.type.length; ++row) {
        if (doesBlockOverlap(params.sim, row, col, shape)) {
          return WORLD_ACTION.BLOCK_SHAPE_ACTION;
        }
      }
    }
    return null;
  };

  const isBlockedFromDown = (params: WorldRuleParams): WORLD_ACTION | null => {
    if (params.action !== ShapeActionName.MOVE_DOWN) {
      return null;
    }
    if (params.sim.posY + params.sim.type.length > WORLD_H) {
      return WORLD_ACTION.STOP_SHAPE_ACTIONS;
    }
    for (let [shape, isActive] of getOtherShapes(params.shape, params.shapes)) {
      if (!doesBBoxOverlap(params.sim, shape)) {
        continue;
      }
      for (let col = 0; col < params.sim.type[0].length; ++col) {
        let prevVal = 0;
        for (let row = params.sim.type.length - 1; row >= 0; --row) {
          const val = params.sim.type[row][col];
          if (val && !prevVal) {
            if (doesBlockOverlap(params.sim, row, col, shape)) {
              if (params.sim.posY <= 0) {
                return WORLD_ACTION.END_THE_GAME;
              }
              if (isActive) {
                return WORLD_ACTION.BLOCK_SHAPE_ACTION;
              }
              return WORLD_ACTION.STOP_SHAPE_ACTIONS;
            }
          }
          prevVal = val;
        }
      }
    }
    return null;
  };

  return [isBlockedFromLeft, isBlockedFromRight, isBlockedFromDown];
};
