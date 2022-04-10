import * as PIXI from "pixi.js";
import { BLOCK_W, COLOR_BG, COLOR_FR, WORLD_H, WORLD_W } from "./config";
import type { Shape } from "./shape";

const OPTIONS: PIXI.IApplicationOptions = {
  antialias: true,
  backgroundColor: COLOR_BG,
  width: (WORLD_W + 2) * BLOCK_W,
  height: (WORLD_H + 2) * BLOCK_W,
};

export interface Renderer {
  insertShape(shape: Shape): void;
  updateShape(shape: Shape): void;
  removeShape(shape: Shape): void;
  updatePoints(points: number): void;
}

type ShapeView = PIXI.Graphics;

export const createCanvasRenderer = (target: HTMLElement): Renderer => {
  const container = new PIXI.Container();
  const shapes = new Map<Shape, ShapeView>();
  const canvas = new PIXI.Application({ ...OPTIONS });
  const border = new PIXI.Graphics();
  const points = new PIXI.Text("0");

  points.position.x = -BLOCK_W;
  points.position.y = -BLOCK_W;
  container.addChild(points);

  const redrawShapeView = (shape: Shape, view: ShapeView): void => {
    view.clear();
    view.beginFill(COLOR_BG);
    view.lineStyle(2, shape.color, 1, 0.5);
    for (let y = 0; y < shape.type.length; ++y) {
      const row = shape.type[y];
      for (let x = 0; x < row.length; ++x) {
        if (row[x]) {
          view.drawRect(BLOCK_W * x, BLOCK_W * y, BLOCK_W, BLOCK_W);
        }
      }
    }
    view.endFill();
  };

  const createShapeView = (shape: Shape): ShapeView => {
    const view = new PIXI.Graphics();
    view.position.x = shape.posX * BLOCK_W;
    view.position.y = shape.posY * BLOCK_W;
    redrawShapeView(shape, view);
    return view;
  };

  const setupCanvas = () => {
    target.appendChild(canvas.view);
    border.beginFill(COLOR_FR);
    border.drawRect(0, 0, BLOCK_W, BLOCK_W * (WORLD_H + 2));
    border.drawRect(
      BLOCK_W * (WORLD_W + 1),
      0,
      BLOCK_W,
      BLOCK_W * (WORLD_H + 2)
    );
    border.drawRect(
      0,
      BLOCK_W * (WORLD_H + 1),
      BLOCK_W * (WORLD_H + 2),
      BLOCK_W
    );
    canvas.stage.addChild(border);
    container.position.x = BLOCK_W;
    container.position.y = BLOCK_W;
    canvas.stage.addChild(container);
  };

  const insertShape = (shape: Shape) => {
    const view = createShapeView(shape);
    shapes.set(shape, view);
    container.addChild(view);
  };

  const updateShape = (shape: Shape) => {
    const view = shapes.get(shape) as ShapeView;
    view.position.x = shape.posX * BLOCK_W;
    view.position.y = shape.posY * BLOCK_W;
    redrawShapeView(shape, view);
  };

  const removeShape = (shape: Shape) => {
    const view = shapes.get(shape) as ShapeView;
    shapes.delete(shape);
    container.removeChild(view);
  };

  const updatePoints = (value: number) => {
    points.text = `${value}`;
  };

  // init !
  setupCanvas();

  return {
    insertShape,
    updateShape,
    removeShape,
    updatePoints,
  };
};
