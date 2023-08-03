export let PLATFORM: string;
export let IS_STEAM_DECK: boolean;
export let BRANCH: string;
export let CONFIGURATION: string;

interface Package {
  path: string;
  assetpath: { path: string; manifest?: string }[];
  loaders: any[];
  // Add other properties and methods as needed
}

export declare const Package: Package;
export let MODS_ROOT: string;
export declare function kleiloadlua(
  filename: string,
  manifest?: string,
  modulepath?: string
): any;

/**
 * Checks if a file exists.
 * @param filename The file path to check.
 * @param manifest The manifest to use for checking.
 * @param original_filename The original file path to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
export declare function kleifileexists(
  filename: string,
  manifest?: any,
  original_filename?: string
): boolean;
