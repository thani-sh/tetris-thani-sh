type Keymap = { [key: string]: string }

type Callback = (action: string) => void

export interface Player {
    color: number
    listen: (fn: Callback) => void
    destroy: () => void
}

export const createKeyboardPlayer = (color: number, keymap: Keymap): Player => {
    const callbacks: Callback[] = []

    const keyDownListener = (e: KeyboardEvent) => {
        for (const key of Object.keys(keymap)) {
            if (e.code === key) {
                triggerCallbacks(keymap[key]);
                break;
            }
        }
    }

    const triggerCallbacks = (action: string) => {
        for (const callback of callbacks) {
            callback(action)
        }
    }

    const setupPlayer = () => {
        document.addEventListener('keydown', keyDownListener);
    }

    const listen = (fn: Callback): void => {
        callbacks.push(fn)
    }

    const destroy = () => {
        document.removeEventListener('keydown', keyDownListener);
    }

    // init !
    setupPlayer()

    return {
        color,
        listen,
        destroy,
    }
}
