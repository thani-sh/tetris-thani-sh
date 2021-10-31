import { useEffect, useRef } from 'react'
import { createKeyboardPlayer } from './game/player'
import { createCanvasRenderer } from './game/renderer'
import { createGameWorld } from './game/world'

const KEYMAP_WASD = {
    KeyW: 'ROTATE',
    KeyA: 'MOVE_LEFT',
    KeyS: 'MOVE_DOWN',
    KeyD: 'MOVE_RIGHT',
}

const KEYMAP_ULDR = {
    ArrowUp: 'ROTATE',
    ArrowLeft: 'MOVE_LEFT',
    ArrowDown: 'MOVE_DOWN',
    ArrowRight: 'MOVE_RIGHT',
}

export const Game = () => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) {
            return
        }
        const player1 = createKeyboardPlayer(0x6FA8DC, KEYMAP_WASD)
        const player2 = createKeyboardPlayer(0xF6B26B, KEYMAP_ULDR)
        const renderer = createCanvasRenderer(containerRef.current)
        createGameWorld([player1, player2], renderer)
    }, [containerRef])

    return <div ref={containerRef} />
}
