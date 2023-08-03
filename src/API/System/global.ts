// define strict.lua
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
  LoadPrefabs(prefabs: string[]): void;
  // Add other methods and properties as needed
}

export declare const TheSim: TheSim;

interface TheInput {
  IsKeyDown(key: number): boolean;
  IsKeyDownAsync(key: number): Promise<boolean>;
  IsMouseDown(button: number): boolean;
  IsMouseDownAsync(button: number): Promise<boolean>;
  GetMousePosition(): [number, number];
  GetWorldEntityUnderMouse(): any;
  // Add other methods and properties as needed
}

export declare const TheInput: TheInput;

interface TheMap {
  GetPlatformAtPoint(x: number, y: number): any;
  IsVisualGroundAtPoint(x: number, y: number, z: number): boolean;
  // Add other methods and properties as needed
}

export declare const TheMap: TheMap;

interface TheWorld {
  Map: TheMap;
  // Add other methods and properties as needed
}

export declare const TheWorld: TheWorld;

/**
 * Defined in main.ts
 */
export declare const TheMixer;
