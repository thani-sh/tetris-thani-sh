import type { ShapeType } from "./shape_type";

export interface Shape {
  id: number;
  type: ShapeType;
  posX: number;
  posY: number;
  color: number;
}
