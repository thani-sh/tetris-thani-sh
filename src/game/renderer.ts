import * as PIXI from 'pixi.js'
import { BLOCK_SZ, COLOR_BG, WORLD_H, WORLD_W } from './config'
import type { Shape } from './shape'

const OPTIONS: PIXI.IApplicationOptions = {
    antialias: true,
    backgroundColor: COLOR_BG,
    width: WORLD_W * BLOCK_SZ,
    height: WORLD_H * BLOCK_SZ,
}

export interface Renderer {
    insertShape(shape: Shape): void
    updateShape(shape: Shape): void
    removeShape(shape: Shape): void
}

interface ShapeAndView {
    shape: Shape
    view: PIXI.Graphics;
}

const redrawShapeView = (shape: Shape, view: PIXI.Graphics): void => {
    const dots = shape.type.dots
    view.clear()
    view.beginFill(COLOR_BG)
    view.lineStyle(2, shape.color, 1, 0.5);
    for (let y = 0; y < dots.length; ++y) {
        const row = dots[y]
        for (let x = 0; x < row.length; ++x) {
            if (row[x]) {
                view.drawRect(BLOCK_SZ * x, BLOCK_SZ * y, BLOCK_SZ, BLOCK_SZ);
            }
        }
    }
    view.endFill()
}

const createShapeView = (shape: Shape): PIXI.Graphics => {
    const view = new PIXI.Graphics()
    view.position.x = shape.posX * BLOCK_SZ
    view.position.y = shape.posY * BLOCK_SZ
    redrawShapeView(shape, view)
    return view
}

export const createCanvasRenderer = (target: HTMLElement): Renderer => {
    const shapes: { [key: number]: ShapeAndView } = {};
    const canvas = new PIXI.Application({ ...OPTIONS })
    const container = new PIXI.Container()

    const setupCanvas = () => {
        target.appendChild(canvas.view)
        container.position.x = BLOCK_SZ
        container.position.y = BLOCK_SZ
        canvas.stage.addChild(container)
    }

    const insertShape = (shape: Shape) => {
        const view = createShapeView(shape)
        shapes[shape.id] = { shape, view }
        container.addChild(view)
    }

    const updateShape = (shape: Shape) => {
        const view = shapes[shape.id].view
        view.position.x = shape.posX * BLOCK_SZ
        view.position.y = shape.posY * BLOCK_SZ
        redrawShapeView(shape, view)
    }

    const removeShape = (shape: Shape) => {
        const view = shapes[shape.id].view
        delete shapes[shape.id]
        container.removeChild(view)
    }

    // init !
    setupCanvas()

    return {
        insertShape,
        updateShape,
        removeShape,
    }
}
