interface Debug {
  getinfo(what?: string | number, info?: string | number): DebugInfo;
  traceback: any;
  sethook(hook: Function, mask?: string, count?: number): void;
  // Add other methods and properties as needed
}

interface DebugInfo {
  source: string;
  short_src: string;
  linedefined: number;
  lastlinedefined: number;
  what: string;
  name?: string;
  namewhat?: string;
  currentline?: number;
  // Add other properties as needed
}

export declare const debug: Debug;
export let _G = { tracked_assert: null, assert: null };

export declare function loadstring(code: string): Function;
export declare function setfenv(
  fn: Function,
  env: { [key: string]: any }
): void;
export declare function xpcall(
  fn: Function,
  error_handler: Function
): [boolean, any];
export declare function debugstack(): string;
export declare function assert(
  v: any,
  message?: string | number | boolean
): asserts v;
