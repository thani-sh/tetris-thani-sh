import { ShapeActionName } from "./shape_action";

type Keymap = { [key: string]: ShapeActionName };

type Callback = (action: ShapeActionName) => void;

export interface Player {
  color: number;
  listen: (fn: Callback) => void;
  destroy: () => void;
}

export const createKeyboardPlayer = (color: number, keymap: Keymap): Player => {
  const callbacks: Callback[] = [];

  const keyDownListener = (e: KeyboardEvent) => {
    for (const key of Object.keys(keymap)) {
      if (e.code === key) {
        triggerCallbacks(keymap[key]);
        break;
      }
    }
  };

  const triggerCallbacks = (action: ShapeActionName) => {
    for (const callback of callbacks) {
      callback(action);
    }
  };

  const setupPlayer = () => {
    document.addEventListener("keydown", keyDownListener);
  };

  const listen = (fn: Callback): void => {
    callbacks.push(fn);
  };

  const destroy = () => {
    document.removeEventListener("keydown", keyDownListener);
  };

  // init !
  setupPlayer();

  return {
    color,
    listen,
    destroy,
  };
};
