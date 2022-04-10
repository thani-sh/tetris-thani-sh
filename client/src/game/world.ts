import type { Player } from "./player";
import type { Renderer } from "./renderer";
import type { Ticker, CancelTicker } from "./ticker";
import type { Shape } from "./shape";
import type { WorldRule } from "./world_rule";
import { WORLD_W } from "./config";
import { WORLD_ACTION } from "./world_action";
import { ShapeActionName, SHAPE_ACTIONS } from "./shape_action";
import { ShapeType, SHAPE_TYPES } from "./shape_type";

export interface GameWorldOptions {
  players: Player[];
  renderer: Renderer;
  ruleset: WorldRule[];
  ticker: Ticker;
}

export const createGameWorld = (options: GameWorldOptions): (() => void) => {
  const shapes: Shape[][] = options.players.map(() => []);
  const timers: CancelTicker[] = [];
  const activeShapes: number[] = [];

  let clearedCount: number = 0;
  let nextShapeId: number = 1;

  const getShapeType = (): ShapeType => {
    return SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)]();
  };

  const getShapePosX = (pidx: number): number => {
    return pidx * Math.floor(WORLD_W / options.players.length);
  };

  const clearLines = () => {
    const rows: {
      [rowNumber: number]: {
        counter: number;
        shapes: {
          [shapeId: number]: {
            shape: Shape;
            shapeRow: number;
          };
        };
      };
    } = {};

    // identify blocks which need to be cleared
    for (let pidx = 0; pidx < shapes.length; pidx++) {
      for (let sidx = 1; sidx < shapes[pidx].length; sidx++) {
        const shape = shapes[pidx][sidx];
        for (let y = 0; y < shape.type.length; y++) {
          for (let x = 0; x < shape.type[y].length; x++) {
            const blockY = shape.posY + y;
            const blockV = shape.type[y][x];
            if (!blockV) {
              continue;
            }
            if (!rows[blockY]) {
              rows[blockY] = { counter: 0, shapes: {} };
            }
            rows[blockY].counter++;
            if (!rows[blockY].shapes[shape.id]) {
              rows[blockY].shapes[shape.id] = { shape, shapeRow: y };
            }
          }
        }
      }
    }

    // clear the blocks
    for (let y in rows) {
      const { counter, shapes } = rows[y];
      if (counter < WORLD_W) {
        continue;
      }
      for (let shapeId in shapes) {
        const { shape, shapeRow } = shapes[shapeId];
        shape.type[shapeRow] = [];
      }
    }
    const deletedShapes: number[] = [];
    for (let y in rows) {
      const { counter, shapes } = rows[y];
      if (counter < WORLD_W) {
        continue;
      }
      clearedCount++;
      options.renderer.updatePoints(clearedCount);
      for (let shapeId in shapes) {
        const { shape } = shapes[shapeId];
        if (deletedShapes.indexOf(shape.id) >= 0) {
          continue;
        }
        for (let i = 0; i < shape.type.length; i++) {
          if (shape.type[i].length === 0) {
            shape.type.splice(i, 1);
            activate(shape.id);
          }
        }
        if (!shape.type.length) {
          delShape(shape.id);
          deletedShapes.push(shape.id);
        }
      }
    }
  };

  const addShape = (pidx: number) => {
    const color = options.players[pidx].color;
    const type = getShapeType();
    const posX = getShapePosX(pidx);
    const posY = -type.length;
    const shape: Shape = { id: nextShapeId++, type, color, posX, posY };
    shapes[pidx].unshift(shape);
    options.renderer.insertShape(shape);
  };

  const delShape = (shapeId: number) => {
    const { shape, pidx, sidx } = findShape(shapeId);
    shapes[pidx].splice(sidx, 1);
    options.renderer.removeShape(shape);
    deactivate(shapeId);
  };

  const findShape = (shapeId: number) => {
    for (let pidx = 0; pidx < shapes.length; pidx++) {
      for (let sidx = 0; sidx < shapes[pidx].length; sidx++) {
        const shape = shapes[pidx][sidx];
        if (shape.id === shapeId) {
          return { shape, pidx, sidx };
        }
      }
    }
    throw new Error("mising shape");
  };

  const findShapesAbove = (shapeA: Shape) => {
    const shapesAbove: Shape[] = [];
    for (let pidx = 0; pidx < shapes.length; pidx++) {
      for (let sidx = 0; sidx < shapes[pidx].length; sidx++) {
        const shapeB = shapes[pidx][sidx];
        if (
          shapeB.posX + shapeB.type[0].length >= shapeA.posX &&
          shapeB.posX <= shapeA.posX + shapeA.type[0].length &&
          shapeB.posY < shapeA.posY
        ) {
          shapesAbove.push(shapeB);
        }
      }
    }
    return shapesAbove;
  };

  const activate = (shapeId: number) => {
    if (activeShapes.indexOf(shapeId) === -1) {
      activeShapes.push(shapeId);
    }
  };

  const deactivate = (shapeId: number) => {
    const idx = activeShapes.indexOf(shapeId);
    if (idx !== -1) {
      activeShapes.splice(idx, 1);
    }
  };

  const endTheGame = () => {
    alert("GAME OVER!");
    destroy();
  };

  const handleAction = (
    pidx: number,
    sidx: number,
    action: ShapeActionName
  ) => {
    const shape = shapes[pidx][sidx];
    const sim = Object.create(shape) as Shape;
    SHAPE_ACTIONS[action](sim);
    for (let ridx = 0; ridx < options.ruleset.length; ++ridx) {
      const ruleFn = options.ruleset[ridx];
      const result = ruleFn({ shape, sim, shapes, action });
      if (result === WORLD_ACTION.BLOCK_SHAPE_ACTION) {
        return;
      } else if (result === WORLD_ACTION.STOP_SHAPE_ACTIONS) {
        if (sidx === 0) {
          addShape(pidx);
        } else {
          deactivate(shape.id);
        }
        clearLines();
        return;
      } else if (result === WORLD_ACTION.END_THE_GAME) {
        endTheGame();
      }
    }
    SHAPE_ACTIONS[action](shape);
    options.renderer.updateShape(shape);
    if (sidx !== 0) {
      const shapesToActivate = findShapesAbove(shape);
      for (let i = 0; i < shapesToActivate.length; i++) {
        const shape = shapesToActivate[i];
        activate(shape.id);
      }
    }
  };

  const setupWorld = () => {
    for (let pidx = 0; pidx < options.players.length; ++pidx) {
      options.players[pidx].listen((action) => handleAction(pidx, 0, action));
      timers[pidx] = options.ticker(() => {
        handleAction(pidx, 0, ShapeActionName.MOVE_DOWN);
        for (let i = 0; i < activeShapes.length; i++) {
          const shapeId = activeShapes[i];
          const { pidx, sidx } = findShape(shapeId);
          handleAction(pidx, sidx, ShapeActionName.MOVE_DOWN);
        }
      });
      addShape(pidx);
    }
  };

  const destroy = () => {
    for (let pidx = 0; pidx < options.players.length; ++pidx) {
      options.players[pidx].destroy();
    }
    for (let i = 0; i < timers.length; ++i) {
      timers[i]();
    }
  };

  // init !
  setupWorld();

  return destroy;
};
