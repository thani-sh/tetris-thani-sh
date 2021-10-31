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

  let nextShapeId: number = 1;

  const getShapeType = (): ShapeType => {
    return SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
  };

  const getShapePosX = (id: number): number => {
    return id * Math.floor(WORLD_W / options.players.length);
  };

  const clearLines = () => {
    // ...
  };

  const addShape = (id: number) => {
    const color = options.players[id].color;
    const type = getShapeType();
    const posX = getShapePosX(id);
    const posY = -type.length;
    const shape: Shape = { id: nextShapeId++, type, color, posX, posY };
    shapes[id].unshift(shape);
    options.renderer.insertShape(shape);
  };

  const stopWorld = () => {
    alert("GAME OVER!");
    destroy();
  };

  const handleAction = (id: number, action: ShapeActionName) => {
    const shape = shapes[id][0];
    const sim = Object.create(shape) as Shape;
    SHAPE_ACTIONS[action](sim);
    for (let i = 0; i < options.ruleset.length; ++i) {
      const ruleFn = options.ruleset[i];
      const result = ruleFn({ shape, sim, shapes, action });
      if (result === WORLD_ACTION.BLOCK_SHAPE_ACTION) {
        return;
      } else if (result === WORLD_ACTION.STOP_SHAPE_ACTIONS) {
        clearLines();
        addShape(id);
        return;
      } else if (result === WORLD_ACTION.END_THE_GAME) {
        stopWorld();
      }
    }
    SHAPE_ACTIONS[action](shape);
    options.renderer.updateShape(shape);
  };

  const setupWorld = () => {
    for (let i = 0; i < options.players.length; ++i) {
      options.players[i].listen((action) => handleAction(i, action));
      timers[i] = options.ticker(() =>
        handleAction(i, ShapeActionName.MOVE_DOWN)
      );
      addShape(i);
    }
  };

  const destroy = () => {
    for (let i = 0; i < options.players.length; ++i) {
      options.players[i].destroy();
    }
    for (let i = 0; i < timers.length; ++i) {
      timers[i]();
    }
  };

  // init !
  setupWorld();

  return destroy;
};
