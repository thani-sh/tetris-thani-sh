export type CancelTicker = () => void;

export type Ticker = (fn: any) => CancelTicker;

export const createBasicTicker = (t: number): Ticker => {
  return (fn) => {
    let enabled = true;
    const handler = () => {
      if (!enabled) {
        return;
      }
      fn();
      setTimeout(handler, t);
    };
    setTimeout(handler, t);
    return () => {
      enabled = false;
    };
  };
};
