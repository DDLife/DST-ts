import { PLATFORM, IS_STEAM_DECK } from "./predefine";
import { BRANCH, CONFIGURATION } from "./predefine";

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

// define strict.lua
export let MAIN = 1;
export const ENCODE_SAVES: boolean = BRANCH !== "dev";
export const CHEATS_ENABLED: boolean = CONFIGURATION !== "PRODUCTION";
export const CAN_USE_DBUI: boolean =
  CHEATS_ENABLED && PLATFORM === "WIN32_STEAM";
export const SOUNDDEBUG_ENABLED: boolean = false;
export const SOUNDDEBUGUI_ENABLED: boolean = false;
export const WORLDSTATEDEBUG_ENABLED: boolean = false;
export const DEBUG_MENU_ENABLED: boolean =
  BRANCH === "dev" || (IsConsole() && CONFIGURATION !== "PRODUCTION");
export const METRICS_ENABLED: boolean = true;
export const TESTING_NETWORK: number = 1;
export const AUTOSPAWN_MASTER_SECONDARY: boolean = false;
export const DEBUGRENDER_ENABLED: boolean = true;
export const SHOWLOG_ENABLED: boolean = true;
export const POT_GENERATION: boolean = false;

// Networking related configuration
export const DEFAULT_JOIN_IP: string = "127.0.0.1";
export const DISABLE_MOD_WARNING: boolean = false;
export const DEFAULT_SERVER_SAVE_FILE: string = "/server_save";

/**
 * Prefabs object.
 */
export const Prefabs: Record<string, unknown> = {};

/**
 * Ents object.
 */
export const Ents: Record<string, unknown> = {};

/**
 * AwakeEnts object.
 */
export const AwakeEnts: Record<string, unknown> = {};

/**
 * UpdatingEnts object.
 */
export const UpdatingEnts: Record<string, unknown> = {};

/**
 * NewUpdatingEnts object.
 */
export const NewUpdatingEnts: Record<string, unknown> = {};

/**
 * StopUpdatingEnts object.
 */
export const StopUpdatingEnts: Record<string, unknown> = {};

/**
 * StaticUpdatingEnts object.
 */
export const StaticUpdatingEnts: Record<string, unknown> = {};

/**
 * NewStaticUpdatingEnts object.
 */
export const NewStaticUpdatingEnts: Record<string, unknown> = {};

/**
 * StopUpdatingComponents object.
 */
export const StopUpdatingComponents: Record<string, unknown> = {};

/**
 * WallUpdatingEnts object.
 */
export const WallUpdatingEnts: Record<string, unknown> = {};

/**
 * NewWallUpdatingEnts object.
 */
export const NewWallUpdatingEnts: Record<string, unknown> = {};

/**
 * Number of updating entities.
 */
export let num_updating_ents = 0;

/**
 * Number of entities.
 */
export let NumEnts = 0;
