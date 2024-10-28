import ''

declare global {
  function setImmediate(callback: TimerHandler, ...args: any[]): number;
  function clearImmediate(id: number): void;


  interface NodeProcess {
    env: {
      DISPLAY_NAME: string;
      HOMESERVER: string;
      CLIENT_ID: string;
      CLIENT_SECRET: string;
      ACCESS_TOKEN: string;
    } & any;
  }
}
