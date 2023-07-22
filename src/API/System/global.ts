export let MAIN: any;
export let WORLDGEN_MAIN: any;
export let CWD: string | undefined;

/**
 * Defined in dumper.ts
 */
interface TheSim {
  SetReverbPreset(preset: string): void;
  SendJSMessage(message: string): void;
  GetFileModificationTime(filename: string): number;
  LuaPrint(...args: any[]): void;
  // Add other methods and properties as needed
}

export declare const TheSim: TheSim;
