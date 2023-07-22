interface Debug {
  getinfo(what?: string | number, info?: string | number): DebugInfo;
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
export let _G = {};
