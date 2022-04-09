import { useEffect, useRef } from "react";
import { createKeyboardPlayer } from "./game/player";
import { createCanvasRenderer } from "./game/renderer";
import { ShapeActionName } from "./game/shape_action";
import { createBasicTicker } from "./game/ticker";
import { createGameWorld } from "./game/world";
import { createWorldRules } from "./game/world_rule";

const KEYMAP_WASD = {
  KeyW: ShapeActionName.ROTATE,
  KeyA: ShapeActionName.MOVE_LEFT,
  KeyS: ShapeActionName.MOVE_DOWN,
  KeyD: ShapeActionName.MOVE_RIGHT,
};

const KEYMAP_ULDR = {
  ArrowUp: ShapeActionName.ROTATE,
  ArrowLeft: ShapeActionName.MOVE_LEFT,
  ArrowDown: ShapeActionName.MOVE_DOWN,
  ArrowRight: ShapeActionName.MOVE_RIGHT,
};

export const Game = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const player1 = createKeyboardPlayer(0x6fa8dc, KEYMAP_WASD);
    const player2 = createKeyboardPlayer(0xf6b26b, KEYMAP_ULDR);
    const players = [player1, player2];
    const renderer = createCanvasRenderer(containerRef.current);
    const ticker = createBasicTicker(500);
    const ruleset = createWorldRules();
    createGameWorld({ players, renderer, ticker, ruleset });
  }, [containerRef]);

  return <div ref={containerRef} />;
};
