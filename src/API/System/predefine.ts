export let PLATFORM: string;
export let IS_STEAM_DECK: boolean;
export let BRANCH: string;
export let CONFIGURATION: string;

export function IsConsole(): boolean {
  return PLATFORM === "PS4" || PLATFORM === "XBONE" || PLATFORM === "SWITCH";
}

export function IsNotConsole(): boolean {
  return !IsConsole();
}

export function IsPS4(): boolean {
  return PLATFORM === "PS4";
}

export function IsXB1(): boolean {
  return PLATFORM === "XBONE";
}

export function IsSteam(): boolean {
  return (
    PLATFORM === "WIN32_STEAM" ||
    PLATFORM === "LINUX_STEAM" ||
    PLATFORM === "OSX_STEAM"
  );
}

export function IsWin32(): boolean {
  return PLATFORM === "WIN32_STEAM" || PLATFORM === "WIN32_RAIL";
}

export function IsLinux(): boolean {
  return PLATFORM === "LINUX_STEAM";
}

export function IsRail(): boolean {
  return PLATFORM === "WIN32_RAIL";
}

export function IsSteamDeck(): boolean {
  return IS_STEAM_DECK;
}

interface Package {
  path: string;
  assetpath: { path: string }[];
  loaders: any[];
  // Add other properties and methods as needed
}

export declare const Package: Package;
export let MODS_ROOT: string;
export function kleiloadlua(
  filename: string,
  manifest?: string,
  modulepath?: string
): any {
  // Function implementation goes here
}
