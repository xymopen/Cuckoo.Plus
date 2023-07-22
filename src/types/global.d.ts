import ''

declare global {
  function setImmediate(callback: TimerHandler, ...args: any[]): number;
  function clearImmediate(id: number): void;
}
