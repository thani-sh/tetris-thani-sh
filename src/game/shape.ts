import type { ShapeType } from './shape_type';

export interface Shape {
    id: number
    type: ShapeType
    posX: number
    posY: number
    color: number
}

export const createRandomShape = (id: number, type: ShapeType, color: number, posX: number, posY: number): Shape => ({
    id,
    type,
    color,
    posX,
    posY,
})
