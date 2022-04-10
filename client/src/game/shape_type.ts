export type ShapeType = number[][];
export type ShapeTypeFactory = () => ShapeType;

export const SHAPE_TYPES: ShapeTypeFactory[] = [
  () => [
    [1, 1],
    [1, 1],
  ],
  () => [
    [1, 0, 0],
    [1, 1, 1],
  ],
  () => [
    [0, 1, 0],
    [1, 1, 1],
  ],
  () => [[1, 1, 1]],
];
