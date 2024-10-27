import ''

declare global {
  function setImmediate(callback: TimerHandler, ...args: any[]): number;
  function clearImmediate(id: number): void;


  interface NodeProcess {
    env: {
      DISPLAY_NAME: string;
    } & any;
  }
}
