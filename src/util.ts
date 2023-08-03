import {
  TheInput,
  TheSim,
  IsConsole,
  kleifileexists,
  Package,
  _G,
  loadstring,
  setfenv,
  xpcall,
  debugstack,
  debug,
  assert,
} from "API/System";
import { Vector3 } from "vector3";

/**
 * Converts a table object to an XML string.
 * @param t - The table object to convert.
 * @param name - The name of the table.
 * @returns The XML string representation of the table object.
 */
export function DumpTableXML(t: any, name: string = ""): string {
  const outstr: string[] = [`<table name='${name}'>\n`];
  dumpinternal(t, outstr, "\t");
  outstr.push("</table>");
  return outstr.join("");

  function dumpinternal(t: any, outstr: string[], indent: string) {
    for (const [key, value] of Object.entries(t)) {
      if (typeof value === "object") {
        outstr.push(`${indent}<table name='${key}'>\n`);
        dumpinternal(value, outstr, `${indent}\t`);
        outstr.push(`${indent}</table>\n`);
      } else {
        outstr.push(
          `${indent}<${typeof value} name='${key}' val='${value}'/>\n`
        );
      }
    }
  }
}

// TODO:
const Prefabs: any = {};
function SpawnPrefab(prefab: string): any {}
function ConsoleWorldPosition(): any {}

/**
 * Spawns a prefab in the game world at the console's current position.
 * @param prefab - The name of the prefab to spawn.
 * @returns The instance of the spawned prefab.
 */
export function DebugSpawn(prefab: string): any {
  if (TheSim !== null && TheInput !== null) {
    TheSim.LoadPrefabs([prefab]);
    const prefabObj = Prefabs[prefab];
    if (prefabObj !== undefined && !prefabObj.is_skin && prefabObj.fn) {
      const inst = SpawnPrefab(prefab);
      if (inst !== null && inst.Transform !== undefined) {
        inst.Transform.SetPosition(ConsoleWorldPosition().Get());
        return inst;
      }
    }
  }
}

/**
 * Returns the closest entity to a target from a list of entities.
 * @param target - The target entity.
 * @param entities - The list of entities to search through.
 * @returns The closest entity to the target.
 */
export function GetClosest(target: any, entities: any[]): any {
  let maxDist: number | null = null;
  let minDist: number | null = null;
  let closest: any = null;

  const tpos = target.GetPosition();

  for (const entity of entities) {
    const epos = entity.GetPosition();
    const dist = distsq(tpos, epos);

    if (maxDist === null || dist > maxDist) {
      maxDist = dist;
    }

    if (minDist === null || dist < minDist) {
      minDist = dist;
      closest = entity;
    }
  }

  return closest;
}

// define many function for operating the table and string
// just skip because js has supported these functions

/**
 * Returns the previous index and value of an array starting from a given index.
 *
 * for iterating over an array in reverse order
 *
 * @param t - The array to iterate over.
 * @param index - The index to start iterating from.
 * @returns An array containing the previous index and value, or undefined if there are no more elements.
 */
export function reverse_next(
  t: any[],
  index: number
): [number, any] | undefined {
  if (index > 0) {
    return [index - 1, t[index - 1]];
  }
}

/**
 * Returns an iterator function that iterates over an array in reverse order.
 * @param t - The array to iterate over.
 * @returns A function that returns the previous index and value of the array, or undefined if there are no more elements.
 */
export function ipairs_reverse(t: any[]): () => [number, any] | undefined {
  let index = t.length;
  return function () {
    const result = reverse_next(t, index);
    if (result !== undefined) {
      index = result[0];
    }
    return result;
  };
}

/**
 * ! only use on indexed tables!
 *
 * Returns a flattened array from a sparse array.
 * @param tab - The sparse array to flatten.
 * @returns A new array with the same elements as the input array, but without the empty slots.
 */
export function GetFlattenedSparse(tab: any[]): any[] {
  const keys = Object.keys(tab)
    .map(Number)
    .sort((a, b) => a - b);
  const ret: any[] = [];
  for (const oidx of keys) {
    ret.push(tab[oidx]);
  }
  return ret;
}

/**
 * Removes all instances of a value from an array-type table.
 * @param t The table to remove values from.
 * @param value The value to remove.
 */
export function RemoveByValue(t: any[], value: any): void {
  if (t !== null && t !== undefined) {
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i] === value) {
        t.splice(i, 1);
      }
    }
  }
}

/**
 * Counts the number of keys/values in a table.
 * @param table The table to count.
 * @returns The number of keys/values in the table.
 */
export function GetTableSize(table: any): number {
  let numItems = 0;
  if (table !== null && table !== undefined) {
    for (const key in table) {
      if (table.hasOwnProperty(key)) {
        numItems++;
      }
    }
  }
  return numItems;
}

/**
 * Returns a random item from an array-type table.
 * @param choices The table to choose from.
 * @returns A randomly selected item from the table, or undefined if the table is empty.
 */
export function GetRandomItem<T>(choices: T[]): T | undefined {
  const numChoices = choices.length;

  if (numChoices < 1) {
    return undefined;
  }

  let choice = Math.floor(Math.random() * numChoices);

  let picked: T | undefined = undefined;
  // pick n-th as the result
  for (const item of choices) {
    picked = item;
    if (choice <= 0) {
      break;
    }
    choice--;
  }
  return picked;
}

/**
 * Returns a random key-value pair from a table.
 * @param choices The table to choose from.
 * @returns A randomly selected key-value pair from the table, or undefined if the table is empty.
 */
export function GetRandomItemWithIndex<T>(choices: {
  [key: string]: T;
}): [string, T] | undefined {
  const numChoices = GetTableSize(choices);

  if (numChoices < 1) {
    return undefined;
  }

  const choice = Math.floor(Math.random() * numChoices);

  let idx: string | undefined = undefined;
  let item: T | undefined = undefined;
  let i = 0;

  for (const [k, v] of Object.entries(choices)) {
    idx = k;
    item = v;
    if (i >= choice) {
      break;
    }
    i++;
  }

  if (idx === undefined || item === undefined) {
    throw new Error("Unexpected undefined value");
  }

  return [idx, item];
}

/**
 * Returns a randomly selected subset of items from an array-type table.
 * @param num The number of items to select.
 * @param choices The table to choose from.
 * @returns An array of randomly selected items from the table, or an empty array if the table is empty.
 */
export function PickSome<T>(num: number, choices: T[]): T[] {
  const l_choices = [...choices];
  const ret: T[] = [];

  for (let i = 0; i < num; i++) {
    const choice = Math.floor(Math.random() * l_choices.length);
    ret.push(l_choices[choice]);
    l_choices.splice(choice, 1);
  }

  return ret;
}

/**
 * Returns a randomly selected subset of items from an array-type table, allowing duplicates.
 * @param num The number of items to select.
 * @param choices The table to choose from.
 * @returns An array of randomly selected items from the table, or an empty array if the table is empty.
 */
export function PickSomeWithDups<T>(num: number, choices: T[]): T[] {
  const l_choices = [...choices];
  const ret: T[] = [];

  for (let i = 0; i < num; i++) {
    const choice = Math.floor(Math.random() * l_choices.length);
    ret.push(l_choices[choice]);
  }

  return ret;
}

// define some array operations js has supported

/**
 * Merges two or more map-style tables, overwriting duplicate keys with the latter map's value.
 * Subtables are recursively merged.
 * @param maps The maps to merge.
 * @returns A new map-style table containing the merged values.
 * @throws An error if attempting to merge incompatible tables.
 */
export function MergeMapsDeep(...maps: { [key: string]: any }[]): {
  [key: string]: any;
} {
  const keys: { [key: string]: string } = {};
  for (const map of maps) {
    for (const [k, v] of Object.entries(map)) {
      if (keys[k] === undefined) {
        keys[k] = typeof v;
      } else {
        if (keys[k] !== typeof v) {
          throw new Error("Attempting to merge incompatible tables.");
        }
      }
    }
  }

  const ret: { [key: string]: any } = {};
  for (const k of Object.keys(keys)) {
    if (keys[k] === "object") {
      const submaps = maps.map((m) => m[k]).filter((v) => v !== undefined);
      ret[k] = MergeMapsDeep(...submaps);
    } else {
      ret[k] = maps[maps.length - 1][k];
    }
  }

  return ret;
}

/**
 * Merges two or more lists of key-value pairs, overwriting duplicate keys with the latter list's value.
 *
 * overwrites duplicate "keys" with the latter list's value
 *
 * @param lists The lists to merge.
 * @returns A new list of merged key-value pairs.
 */
export function MergeKeyValueList(
  ...lists: [string, any][][]
): [string, any][] {
  const ret: { [key: string]: any } = {};
  for (const list of lists) {
    for (const [k, v] of list) {
      ret[k] = v;
    }
  }
  return Object.entries(ret);
}

/**
 * Returns a new map-style table containing the key-value pairs from `base` that are not present in `subtract`.
 * Subtables are recursively subtracted.
 * @param base The base map-style table.
 * @param subtract The map-style table to subtract from `base`.
 * @returns A new map-style table containing the key-value pairs from `base` that are not present in `subtract`.
 */
export function SubtractMapKeys(
  base: { [key: string]: any },
  subtract: { [key: string]: any }
): { [key: string]: any } {
  const ret: { [key: string]: any } = {};
  for (const [k, v] of Object.entries(base)) {
    const subtract_v = subtract[k];
    if (subtract_v === undefined) {
      // no subtract entry => keep key+value in ret table
      ret[k] = v;
    } else if (typeof subtract_v === "object" && typeof v === "object") {
      const subtable = SubtractMapKeys(v, subtract_v);
      if (Object.keys(subtable).length > 0) {
        ret[k] = subtable;
      }
    }
    // otherwise, subtract entry exists => drop key+value from ret table
  }
  return ret;
}

/**
 * Adds `addition` to the end of `orig`, `mult` times.
 * @param orig The original array.
 * @param addition The array to add to the end of `orig`.
 * @param mult The number of times to add `addition` to the end of `orig`. Defaults to 1.
 * @returns A new array containing the elements of `orig` followed by `addition` repeated `mult` times.
 */
export function ExtendedArray<T>(
  orig: T[],
  addition: T[],
  mult: number = 1
): T[] {
  const ret: T[] = [...orig];
  for (let i = 0; i < mult; i++) {
    ret.push(...addition);
  }
  return ret;
}

/**
 * Recursively flattens a tree-like table `tree` into a list.
 * @param tree The tree-like table to flatten.
 * @param ret The list to append the flattened elements to.
 * @param exclude A table of elements to exclude from the flattened list.
 * @param unique A unique identifier to use for excluded elements.
 * @returns The flattened list.
 */
function _FlattenTree(
  tree: { [key: string]: any },
  ret: any[],
  exclude: { [key: string]: any },
  unique: any
): any[] {
  for (const [k, v] of Object.entries(tree)) {
    if (typeof v === "object") {
      _FlattenTree(v, ret, exclude, unique);
    } else if (!exclude[v]) {
      ret.push(v);
      exclude[v] = unique;
    }
  }
  return ret;
}

/**
 * Recursively flattens a tree-like table `tree` into a list, excluding duplicate elements.
 * @param tree The tree-like table to flatten.
 * @param unique A unique identifier to use for excluded elements.
 * @returns The flattened list.
 */
export function FlattenTree(tree: { [key: string]: any }, unique: any): any[] {
  return _FlattenTree(tree, [], {}, unique);
}

/**
 * Returns a random key from the given table `choices`.
 * @param choices The table to choose a random key from.
 * @returns A random key from the given table `choices`.
 * @throws An error if the input table is empty.
 */
export function GetRandomKey<T>(choices: { [key: string]: T }): string {
  const choice = Math.floor(Math.random() * Object.keys(choices).length);
  let i = 0;
  for (const k in choices) {
    if (i === choice) {
      return k;
    }
    i++;
  }
  throw new Error("Input table is empty.");
}

/**
 * Returns a random number with variance added to a base value.
 * @param baseval The base value.
 * @param randomval The variance to add to the base value.
 * @returns A random number with variance added to the base value.
 */
export function GetRandomWithVariance(
  baseval: number,
  randomval: number
): number {
  return baseval + (Math.random() * 2 * randomval - randomval);
}

/**
 * Returns a random number between `min` and `max`.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns A random number between `min` and `max`.
 */
export function GetRandomMinMax(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Calculates the squared distance between two points in 2D or 3D space.
 * @param v1 The first point, either as an object with `x`, `y`, and `z` properties or as an array with at least 2 elements.
 * @param v2 The second point, either as an object with `x`, `y`, and `z` properties or as an array with at least 2 elements.
 * @returns The squared distance between the two points.
 * @throws An error if either input point is `null` or `undefined`.
 */
export function distsq(
  v1: { x?: number; y?: number; z?: number } | number[],
  v2: { x?: number; y?: number; z?: number } | number[]
): number;
/**
 * Calculates the squared distance between two 2D vectors.
 * @param x1 The x-coordinate of the first vector.
 * @param y1 The y-coordinate of the first vector.
 * @param x2 The x-coordinate of the second vector.
 * @param y2 The y-coordinate of the second vector.
 * @returns The squared distance between the two vectors.
 */
export function distsq(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Calculates the squared distance between two 3D vectors.
 * @param x1 The x-coordinate of the first vector.
 * @param y1 The y-coordinate of the first vector.
 * @param z1 The z-coordinate of the first vector.
 * @param x2 The x-coordinate of the second vector.
 * @param y2 The y-coordinate of the second vector.
 * @param z2 The z-coordinate of the second vector.
 * @returns The squared distance between the two vectors.
 */
export function distsq(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
): number;
export function distsq(
  v1: any,
  v2: any,
  v3?: any,
  v4?: any,
  v5?: any,
  v6?: any
): number {
  if (!v1 || !v2) {
    throw new Error("Input point is null or undefined.");
  }
  if (
    typeof v1 === "number" &&
    typeof v2 === "number" &&
    typeof v3 === "number" &&
    typeof v4 === "number"
  ) {
    const dx = v1 - v3;
    const dy = v2 - v4;
    const dz = v5 ? v5 - v6 : 0;
    return dx * dx + dy * dy + dz * dz;
  }
  const dx = (v1.x || v1[0]) - (v2.x || v2[0]);
  const dy = (v1.y || v1[1]) - (v2.y || v2[1]);
  const dz = (v1.z || v1[2] || 0) - (v2.z || v2[2] || 0);
  return dx * dx + dy * dy + dz * dz;
}

let memoizedFilePaths: { [key: string]: string | null } = {};

/**
 * Returns the memoized file paths as a compressed and encoded string.
 * @returns The memoized file paths as a compressed and encoded string.
 */
export function GetMemoizedFilePaths(): string {
  return ZipAndEncodeSaveData(memoizedFilePaths);
}

/**
 * Sets the memoized file paths from a compressed and encoded string.
 * @param memoized_file_paths The memoized file paths as a compressed and encoded string.
 */
export function SetMemoizedFilePaths(memoized_file_paths: string): void {
  memoizedFilePaths = DecodeAndUnzipSaveData(memoized_file_paths);
}

/**
 * Resolves a file path to an absolute path, without memoization or error checking.
 * @param filepath The file path to resolve.
 * @param force_path_search Whether to force a path search.
 * @param search_first_path The most likely path for the asset.
 * @returns The resolved file path, or `null` if it could not be found.
 */
function softresolvefilepath_internal(
  filepath: string,
  force_path_search?: boolean,
  search_first_path?: string
): string | null {
  force_path_search = force_path_search || false;

  if (IsConsole() && !force_path_search) {
    return filepath; // it's already absolute, so just send it back
  }

  // on PC platforms, search all the possible paths

  // mod folders don't have "data" in them, so we strip that off if necessary. It will
  // be added back on as one of the search paths.
  filepath = filepath.replace(/^\/+/, "");

  // sometimes from context we can know the most likely path for an asset, this can result in less time spent searching the tons of mod search paths.
  if (search_first_path) {
    const filename = search_first_path + filepath;
    if (kleifileexists(filename)) {
      return filename;
    }
  }

  const searchpaths = Package.assetpath;
  for (let i = searchpaths.length - 1; i >= 0; i--) {
    const pathdata = searchpaths[i];
    const filename = pathdata.path + filepath.replace(/\\/g, "/");
    if (kleifileexists(filename, pathdata.manifest, filepath)) {
      return filename;
    }
  }

  // as a last resort see if the file is an already correct path (in case this asset has already been processed)
  if (kleifileexists(filepath)) {
    return filepath;
  }

  return null;
}

/**
 * Resolves a file path to an absolute path, and caches the result for future use.
 * @param filepath The file path to resolve.
 * @param force_path_search Whether to force a path search.
 * @param search_first_path The most likely path for the asset.
 * @returns The resolved file path.
 * @throws An error if the file path could not be found.
 */
function resolvefilepath_internal(
  filepath: string,
  force_path_search?: boolean,
  search_first_path?: string
): string {
  const resolved = softresolvefilepath_internal(
    filepath,
    force_path_search,
    search_first_path
  );
  if (!resolved) {
    throw new Error(
      `Could not find an asset matching ${filepath} in any of the search paths.`
    );
  }
  memoizedFilePaths[filepath] = resolved;
  return resolved;
}

/**
 * Like `resolvefilepath`, but without the crash if it fails.
 * @param filepath The file path to resolve.
 * @param force_path_search Whether to force a path search.
 * @param search_first_path The most likely path for the asset.
 * @returns The resolved file path, or `null` if it could not be found.
 */
export function resolvefilepath_soft(
  filepath: string,
  force_path_search?: boolean,
  search_first_path?: string
): string | null {
  if (memoizedFilePaths[filepath]) {
    return memoizedFilePaths[filepath];
  }
  return softresolvefilepath_internal(
    filepath,
    force_path_search,
    search_first_path
  );
}

/**
 * Resolves a file path to an absolute path.
 * @param filepath The file path to resolve.
 * @param force_path_search Whether to force a path search.
 * @param search_first_path The most likely path for the asset.
 * @returns The resolved file path.
 * @throws An error if the file path could not be found.
 */
export function resolvefilepath(
  filepath: string,
  force_path_search?: boolean,
  search_first_path?: string
): string | null {
  if (memoizedFilePaths[filepath]) {
    return memoizedFilePaths[filepath];
  }
  const resolved = resolvefilepath_internal(
    filepath,
    force_path_search,
    search_first_path
  );
  if (!resolved) {
    throw new Error(
      `Could not find an asset matching ${filepath} in any of the search paths.`
    );
  }
  return resolved;
}

/**
 * Like `softresolvefilepath_internal`, but uses memoization to cache the result.
 * @param filepath The file path to resolve.
 * @param force_path_search Whether to force a path search.
 * @param search_first_path The most likely path for the asset.
 * @returns The resolved file path, or `null` if it could not be found.
 */
export function softresolvefilepath(
  filepath: string,
  force_path_search?: boolean,
  search_first_path?: string
): string | null {
  if (memoizedFilePaths[filepath]) {
    return memoizedFilePaths[filepath];
  }
  const resolved = softresolvefilepath_internal(
    filepath,
    force_path_search,
    search_first_path
  );
  memoizedFilePaths[filepath] = resolved;
  return resolved;
}

let global_type_table = null;

/**
 * Calls the given function on every value in the global environment.
 * @param f The function to call on each value.
 */
export function count_all(f: (value: any) => void): void {
  const seen: { [key: string]: boolean } = {};
  const count_table = function (t: any) {
    if (seen[t]) {
      return;
    }
    f(t);
    seen[t] = true;
    for (const [k, v] of Object.entries(t)) {
      if (typeof v === "object" && v !== null) {
        count_table(v);
      } else {
        f(v);
      }
    }
  };
  count_table(_G);
}

/**
 * Checks if a number is NaN.
 * @param x The number to check.
 * @returns `true` if the number is NaN, `false` otherwise.
 */
export function isnan(x: number): boolean {
  return x !== x;
}

/**
 * Checks if a number is positive or negative infinity.
 * @param x The number to check.
 * @returns `true` if the number is positive or negative infinity, `false` otherwise.
 */
export function isinf(x: number): boolean {
  return x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY;
}

/**
 * Checks if a number is NaN, positive infinity, or negative infinity.
 * @param x The number to check.
 * @returns `true` if the number is NaN, positive infinity, or negative infinity, `false` otherwise.
 */
export function isbadnumber(x: number): boolean {
  return isnan(x) || isinf(x);
}

/**
 * Counts the number of values of each type in the global environment.
 * @returns An object containing the count of values for each type.
 */
function type_count(): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  const enumerate = function (o: any) {
    const t = typeof o;
    counts[t] = (counts[t] || 0) + 1;
  };
  count_all(enumerate);
  return counts;
}

/**
 * Prints a memory report of the number of values of each type in the global environment.
 */
export function mem_report(): void {
  const tmp: { num: number; name: string }[] = [];

  for (const [k, v] of Object.entries(type_count())) {
    tmp.push({ num: v, name: k });
  }
  tmp.sort((a, b) => b.num - a.num);
  const tmp2: string[] = ["MEM REPORT:"];
  for (const [k, v] of Object.entries(tmp)) {
    tmp2.push(`${v.num}\t${v.name}`);
  }

  console.log(tmp2.join("\n"));
}

/**
 * Returns a random choice from a weighted set of choices.
 * @param choices An object containing the choices and their weights.
 * @returns A random choice from the set of choices.
 */
export function weighted_random_choice(choices: {
  [key: string]: number;
}): string {
  const weighted_total = function (choices: { [key: string]: number }): number {
    let total = 0;
    for (const [choice, weight] of Object.entries(choices)) {
      total += weight;
    }
    return total;
  };

  let threshold = Math.random() * weighted_total(choices);
  let last_choice: string | undefined;
  for (const [choice, weight] of Object.entries(choices)) {
    threshold -= weight;
    if (threshold <= 0) {
      return choice;
    }
    last_choice = choice;
  }

  return last_choice as string;
}

/**
 * Returns an array of random choices from a weighted set of choices.
 * @param choices An object containing the choices and their weights.
 * @param num_choices The number of choices to return.
 * @returns An array of random choices from the set of choices.
 */
export function weighted_random_choices(
  choices: { [key: string]: number },
  num_choices: number
): string[] {
  const weighted_total = function (choices: { [key: string]: number }): number {
    let total = 0;
    for (const [choice, weight] of Object.entries(choices)) {
      total += weight;
    }
    return total;
  };

  const picks: string[] = [];
  for (let i = 0; i < num_choices; i++) {
    let pick: string | undefined;
    let threshold = Math.random() * weighted_total(choices);
    for (const [choice, weight] of Object.entries(choices)) {
      threshold -= weight;
      pick = choice;
      if (threshold <= 0) {
        break;
      }
    }
    if (pick) {
      picks.push(pick);
    }
  }

  return picks;
}

/**
 * Returns a string representation of a Lua table.
 * @param tab The table to print.
 * @returns A string representation of the table.
 */
export function PrintTable(tab: { [key: string]: any }): string {
  const str: string[] = [];

  const internal = function (
    tab: { [key: string]: any },
    str: string[],
    indent: string
  ): void {
    for (const [k, v] of Object.entries(tab)) {
      if (typeof v === "object" && v !== null) {
        str.push(indent + k + ":\n");
        internal(v, str, indent + " ");
      } else {
        str.push(indent + k + ": " + v + "\n");
      }
    }
  };

  internal(tab, str, "");
  return str.join("");
}

/**
 * The environment object used for running untrusted code in a sandbox.
 *
 * add functions you know are safe here
 */

let env = {
  loadstring: loadstring, // functions can get serialized to text, this is required to turn them back into functions
};

/**
 * Runs a function `fn` in an environment `fnenv`.
 * @param fn The function to run.
 * @param fnenv The environment to run the function in.
 * @returns A boolean indicating whether the function ran successfully, and the return value of the function or the error message if it failed.
 */
export function RunInEnvironment(
  fn: Function,
  fnenv: { [key: string]: any }
): [boolean, any] {
  setfenv(fn, fnenv);
  return xpcall(fn, debug.traceback);
}

//TODO:
declare function StackTraceToLog(): void;
/**
 * Runs a function `fn` in an environment `fnenv` with error handling.
 * @param fn The function to run.
 * @param fnenv The environment to run the function in.
 * @returns A boolean indicating whether the function ran successfully, and the return value of the function or the error message if it failed.
 */
export function RunInEnvironmentSafe(
  fn: Function,
  fnenv: { [key: string]: any }
): [boolean, any] {
  setfenv(fn, fnenv);
  return xpcall(fn, function (msg: any) {
    console.log(msg);
    StackTraceToLog();
    console.log(debugstack());
    return "";
  });
}

/**
 * Runs untrusted code in a sandbox environment.
 * @param untrusted_code The untrusted code to run.
 * @returns A boolean indicating whether the code ran successfully, and the return value of the code or the error message if it failed.
 */
export function RunInSandbox(untrusted_code: string): [boolean, any] {
  if (untrusted_code.charCodeAt(0) === 27) {
    return [false, "binary bytecode prohibited"];
  }
  const untrusted_function = loadstring(untrusted_code);
  if (!untrusted_function) {
    return [false, "loadstring failed"];
  }
  return RunInEnvironment(untrusted_function, env);
}

/**
 * Runs untrusted code in a safe sandbox environment with error handling.
 * @param untrusted_code The untrusted code to run.
 * @param error_handler The error handler function to use.
 * @returns A boolean indicating whether the code ran successfully, and the return value of the code or the error message if it failed.
 */
export function RunInSandboxSafe(
  untrusted_code: string,
  error_handler?: Function
): [boolean, any] {
  if (untrusted_code.charCodeAt(0) === 27) {
    return [false, "binary bytecode prohibited"];
  }
  const untrusted_function = loadstring(untrusted_code);
  if (!untrusted_function) {
    return [false, "loadstring failed"];
  }
  setfenv(untrusted_function, {});
  return xpcall(untrusted_function, error_handler || function () {});
}

/**
 * Runs untrusted code in a safe sandbox environment with error handling and infinite loop detection.
 * @param untrusted_code The untrusted code to run.
 * @param error_handler The error handler function to use.
 * @returns A boolean indicating whether the code ran successfully, and the return value of the code or the error message if it failed.
 */
export function RunInSandboxSafeCatchInfiniteLoops(
  untrusted_code: string,
  error_handler?: Function
): [boolean, any] {
  if (DEBUGGER_ENABLED) {
    return RunInSandboxSafe(untrusted_code, error_handler);
  }
  if (untrusted_code.charCodeAt(0) === 27) {
    return [false, "binary bytecode prohibited"];
  }
  const untrusted_function = loadstring(untrusted_code);
  if (!untrusted_function) {
    return [false, "loadstring failed"];
  }
  setfenv(untrusted_function, {});

  const co = coroutine.create(function () {
    coroutine.yield(
      xpcall(untrusted_function, error_handler || function () {})
    );
  });
  debug.sethook(
    co,
    function () {
      error("infinite loop detected");
    },
    "",
    20000
  );
  const string_backup = deepcopy(string);
  cleartable(string);
  const result = [coroutine.resume(co)];
  shallowcopy(string_backup, string);
  debug.sethook(co);
  return result.slice(1) as [boolean, any];
}

/**
 * Returns the tick number for the given time.
 * @param target_time The target time to get the tick number for.
 * @returns The tick number for the given time.
 */
export function GetTickForTime(target_time: number): number {
  return Math.floor(target_time / GetTickTime());
}

/**
 * Returns the time for the given tick number.
 * @param target_tick The target tick number to get the time for.
 * @returns The time for the given tick number.
 */
export function GetTimeForTick(target_tick: number): number {
  return target_tick * GetTickTime();
}

/**
 * Returns the remaining time for the given task.
 * @param task The task to get the remaining time for.
 * @returns The remaining time for the given task.
 */
export function GetTaskRemaining(task: Task): number {
  if (task === null) {
    return -1;
  }
  const next_time = task.NextTime();
  if (next_time === null) {
    return -1;
  }
  const current_time = GetTime();
  if (next_time < current_time) {
    return -1;
  }
  return next_time - current_time;
}

/**
 * Returns the time for the next execution of the given task.
 * @param task The task to get the next execution time for.
 * @returns The time for the next execution of the given task.
 */
export function GetTaskTime(task: Task): number {
  if (task === null) {
    return -1;
  }
  const next_time = task.NextTime();
  if (next_time === null) {
    return -1;
  }
  return next_time;
}

/**
 * Shuffles the elements of an array in place.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arrayCount = array.length;
  for (let i = arrayCount; i > 1; i--) {
    const j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
  return array;
}

/**
 * Returns an array of shuffled keys from a dictionary.
 * @param dict The dictionary to get the shuffled keys from.
 * @returns An array of shuffled keys from the dictionary.
 */
export function shuffledKeys<T>(dict: { [key: string]: T }): string[] {
  const keys: string[] = [];
  for (const k in dict) {
    if (dict.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return shuffleArray(keys);
}

/**
 * Returns an array of sorted keys from a dictionary.
 * @param dict The dictionary to get the sorted keys from.
 * @returns An array of sorted keys from the dictionary.
 */
export function sortedKeys<T>(dict: { [key: string]: T }): string[] {
  const keys: string[] = [];
  for (const k in dict) {
    if (dict.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  keys.sort();
  return keys;
}

/**
 * Calls a function pointer with tracking data and asserts the result.
 * @param tracking_data The tracking data to include in the assertion message.
 * @param function_ptr The function pointer to call.
 * @param function_data The data to pass to the function pointer.
 * @returns The result of the function pointer.
 */
export function TrackedAssert<T>(
  tracking_data: string,
  function_ptr: (data: T) => any,
  function_data: T
): any {
  const tracked_assert = function (pass: boolean, reason: string): void {
    assert(pass, tracking_data + " --> " + reason);
  };

  const result = function_ptr(function_data);

  _G["tracked_assert"] = _G.assert;

  return result;
}

/**
 * Returns a deep copy of the given object.
 * @param object The object to copy.
 * @returns A deep copy of the given object.
 */
export function deepcopy<T>(object: T): T {
  const lookup_table = new Map();
  const _copy = (obj: any): any => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    } else if (lookup_table.has(obj)) {
      return lookup_table.get(obj);
    }
    let new_obj: { [key: string]: any } = {};
    lookup_table.set(obj, new_obj);
    for (const [key, value] of Object.entries(obj)) {
      new_obj[_copy(key)] = _copy(value);
    }
    return new_obj;
  };
  return _copy(object);
}

/**
 * Returns a deep copy of the given object without copying its metatable.
 * @param object The object to copy.
 * @returns A deep copy of the given object without copying its metatable.
 */
export function deepcopynometa<T>(object: T): T {
  const _copynometa = (obj: any, lookup_table: Map<any, any>): any => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    } else if (Object.getPrototypeOf(obj) !== undefined) {
      return obj.toString();
    } else if (lookup_table.has(obj)) {
      return lookup_table.get(obj);
    }
    let new_obj: { [key: string]: any } = {};
    lookup_table.set(obj, new_obj);
    for (const [key, value] of Object.entries(obj)) {
      new_obj[_copynometa(key, lookup_table)] = _copynometa(
        value,
        lookup_table
      );
    }
    return new_obj;
  };
  return _copynometa(object, new Map());
}

/**
 * Returns a shallow copy of the given object.
 *
 * @param orig The object to copy.
 * @param dest The destination object to copy to.
 * @returns A shallow copy of the given object.
 *
 * @see http://lua-users.org/wiki/CopyTable
 */
export function shallowcopy<T>(orig: T, dest?: T): T {
  let copy = dest || (Array.isArray(orig) ? [] : {});
  for (const [key, value] of Object.entries(orig)) {
    copy[key] = value;
  }
  return copy;
}

/**
 * Clears all keys and values from the given object.
 * @param object The object to clear.
 */
export function cleartable(object: { [key: string]: any }): void {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      delete object[key];
    }
  }
}

/**
 * Returns a string representation of the given Lua value.
 * @param value The value to dump.
 * @returns A string representation of the given Lua value.
 */
export function fastdump(value: any): string {
  const tostring = (v: any) => String(v);
  const string = String;
  const table = table;
  const items = ["return "];
  const type = (v: any) => typeof v;

  const printtable = (in_table: any) => {
    table.insert(items, "{");

    for (const [k, v] of Object.entries(in_table)) {
      const t = type(v);
      let comma = true;
      if (type(k) === "number") {
        if (t === "number") {
          table.insert(items, string.format("%s", tostring(v)));
        } else if (t === "string") {
          table.insert(items, string.format("[%q]", v));
        } else if (t === "boolean") {
          table.insert(items, string.format("%s", tostring(v)));
        } else if (type(v) === "table") {
          printtable(v);
        }
      } else if (type(k) === "string") {
        const key = tostring(k);
        if (t === "number") {
          table.insert(items, string.format("%s=%s", key, tostring(v)));
        } else if (t === "string") {
          table.insert(items, string.format("%s=%q", key, v));
        } else if (t === "boolean") {
          table.insert(items, string.format("%s=%s", key, tostring(v)));
        } else if (type(v) === "table") {
          if (next(v)) {
            table.insert(items, string.format("%s=", key));
            printtable(v);
          } else {
            comma = false;
          }
        }
      } else {
        assert(false, "trying to save invalid data type");
      }
      if (comma && next(in_table, k)) {
        table.insert(items, ",");
      }
    }

    table.insert(items, "}");
    collectgarbage("step");
  };

  printtable(value);
  return table.concat(items);
}

/**
 * Returns a table index as if the table were circular.
 * @param count The number of elements in the table.
 * @param index The current index in the table.
 * @returns The circular index in the table.
 */
export function circular_index_number(count: number, index: number): number {
  let zb_current = index - 1;
  let zb_result = zb_current;
  zb_result = zb_result % count;
  return zb_result + 1;
}

/**
 * Indexes a table as if it were circular.
 * @param t The table to index.
 * @param index The current index in the table.
 * @returns The circular index in the table.
 */
export function circular_index<T>(t: T[], index: number): T {
  return t[circular_index_number(t.length, index)];
}

/**
 * A circular buffer class that stores a fixed number of elements. (circular array)
 */
export class RingBuffer<T> {
  private buffer: T[];
  private maxlen: number;
  private entries: number;
  private pos: number;

  /**
   * Creates a new RingBuffer instance with the given maximum length.
   * @param maxlen The maximum length of the buffer.
   */
  constructor(maxlen: number) {
    if (typeof maxlen !== "number" || maxlen < 1) {
      maxlen = 10;
    }
    this.buffer = [];
    this.maxlen = maxlen;
    this.entries = 0;
    this.pos = this.buffer.length;
  }

  /**
   * Clears the buffer.
   */
  public Clear(): void {
    this.buffer = [];
    this.entries = 0;
    this.pos = this.buffer.length;
  }

  /**
   * Adds an element to the buffer.
   * @param entry The element to add.
   */
  public Add(entry: T): void {
    const indx = (this.pos % this.maxlen) + 1;

    this.entries = this.entries + 1;
    if (this.entries > this.maxlen) {
      this.entries = this.maxlen;
    }
    this.buffer[indx] = entry;
    this.pos = indx;
  }

  /**
   * Gets an element from the buffer at the given index.
   * @param index The index of the element to get.
   * @returns The element at the given index, or null if the index is out of range.
   */
  public Get(index: number): T | null {
    if (index > this.maxlen || index > this.entries || index < 1) {
      return null;
    }

    let pos = this.pos - this.entries + index;
    if (pos < 1) {
      pos = pos + this.entries;
    }

    return this.buffer[pos];
  }

  /**
   * Gets an array of all elements in the buffer.
   * @returns An array of all elements in the buffer.
   */
  public GetBuffer(): T[] {
    const t: T[] = [];
    for (let i = 1; i <= this.entries; i++) {
      t.push(this.Get(i)!);
    }
    return t;
  }

  /**
   * Resizes the buffer to the given size.
   * @param newsize The new size of the buffer.
   */
  public Resize(newsize: number): void {
    if (typeof newsize !== "number" || newsize < 1) {
      newsize = 1;
    }

    // not dealing with making the buffer smaller
    const nb = this.GetBuffer();

    this.buffer = nb;
    this.maxlen = newsize;
    this.entries = nb.length;
    this.pos = nb.length;
  }
}

/**
 * A position that is relative to a moveable platform.
 * DynamicPosition is for handling a point in the world that should follow a moving walkable_platform.
 */
export class DynamicPosition {
  private walkable_platform: any;
  private local_pt: Vector3;

  /**
   * Creates a new DynamicPosition instance with the given point and walkable platform.
   * @param pt The point in world space.
   * @param walkable_platform The walkable platform to track.
   */
  constructor(pt?: Vector3, walkable_platform?: any) {
    if (pt !== undefined) {
      this.walkable_platform =
        walkable_platform || TheWorld.Map.GetPlatformAtPoint(pt.x, pt.z);
      if (this.walkable_platform !== undefined) {
        this.local_pt = new Vector3(
          this.walkable_platform.entity.WorldToLocalSpace(pt.Get())
        );
      } else {
        // Make copy, saving ref to input Vector can be error prone
        this.local_pt = new Vector3(pt.Get());
      }
    }
  }

  /**
   * Compares this DynamicPosition instance to another instance.
   * @param rhs The other DynamicPosition instance to compare to.
   * @returns True if the instances are equal, false otherwise.
   */
  public equals(rhs: DynamicPosition): boolean {
    return (
      this.walkable_platform === rhs.walkable_platform &&
      this.local_pt.x === rhs.local_pt.x &&
      this.local_pt.z === rhs.local_pt.z
    );
  }

  /**
   * Returns a string representation of this DynamicPosition instance.
   * @returns A string representation of this DynamicPosition instance.
   */
  public toString(): string {
    const pt = this.getPosition();
    return pt !== undefined
      ? `${pt.x.toFixed(2)}, ${pt.z.toFixed(2)} on ${this.walkable_platform}`
      : "nil";
  }

  /**
   * Gets the position of this DynamicPosition instance.
   * @returns The position of this DynamicPosition instance, or null if the walkable platform no longer exists.
   */
  public getPosition(): Vector3 | null {
    if (this.walkable_platform !== undefined) {
      if (this.walkable_platform.IsValid()) {
        return new Vector3(
          this.walkable_platform.entity.LocalToWorldSpace(this.local_pt.Get())
        );
      }
      this.walkable_platform = undefined;
      this.local_pt = undefined;
    }
    return this.local_pt;
  }
}

/**
 * A singly linked list class that allows for iteration and removal of elements.
 */
export class LinkedList<T> {
  public _head: LinkedListNode<T> | null;
  public _tail: LinkedListNode<T> | null;

  /**
   * Creates a new LinkedList instance.
   */
  constructor() {
    this._head = null;
    this._tail = null;
  }

  /**
   * Appends an element to the end of the list.
   * @param v The element to append.
   * @returns The appended element.
   */
  public Append(v: T): T {
    const elem = new LinkedListNode(v);
    if (this._head === null && this._tail === null) {
      this._head = elem;
      this._tail = elem;
    } else {
      elem._prev = this._tail;
      this._tail._next = elem;
      this._tail = elem;
    }

    return v;
  }

  /**
   * Removes an element from the list.
   * @param v The element to remove.
   * @returns True if the element was removed, false otherwise.
   */
  public Remove(v: T): boolean {
    let current = this._head;
    while (current !== null) {
      if (current.data === v) {
        if (current._prev !== null) {
          current._prev._next = current._next;
        } else {
          this._head = current._next;
        }

        if (current._next !== null) {
          current._next._prev = current._prev;
        } else {
          this._tail = current._prev;
        }
        return true;
      }

      current = current._next;
    }

    return false;
  }

  /**
   * Gets the first element in the list.
   * @returns The first element in the list, or null if the list is empty.
   */
  public Head(): T | null {
    return this._head !== null ? this._head.data : null;
  }

  /**
   * Gets the last element in the list.
   * @returns The last element in the list, or null if the list is empty.
   */
  public Tail(): T | null {
    return this._tail !== null ? this._tail.data : null;
  }

  /**
   * Clears the list.
   */
  public Clear(): void {
    this._head = null;
    this._tail = null;
  }

  /**
   * Gets the number of elements in the list.
   * @returns The number of elements in the list.
   */
  public Count(): number {
    let count = 0;
    const it = this.Iterator();
    while (it.Next() !== null) {
      count++;
    }
    return count;
  }

  /**
   * Gets an iterator for the list.
   * @returns An iterator for the list.
   */
  public Iterator(): LinkedListIterator<T> {
    return new LinkedListIterator(this);
  }
}

/**
 * A node in a linked list.
 */
class LinkedListNode<T> {
  public data: T;
  public _prev: LinkedListNode<T> | null;
  public _next: LinkedListNode<T> | null;

  /**
   * Creates a new LinkedListNode instance.
   * @param data The data to store in the node.
   */
  constructor(data: T) {
    this.data = data;
    this._prev = null;
    this._next = null;
  }
}

/**
 * An iterator for a linked list.
 */
class LinkedListIterator<T> {
  private _list: LinkedList<T>;
  private _current: LinkedListNode<T> | null;

  /**
   * Creates a new LinkedListIterator instance.
   * @param list The list to iterate over.
   */
  constructor(list: LinkedList<T>) {
    this._list = list;
    this._current = null;
  }

  /**
   * Gets the current element in the iteration.
   * @returns The current element in the iteration, or null if the end of the list has been reached.
   */
  public Current(): T | null {
    return this._current !== null ? this._current.data : null;
  }

  /**
   * Removes the current element from the list.
   */
  public RemoveCurrent(): void {
    if (this._current === null) {
      return;
    }

    if (this._current._prev === null && this._current._next === null) {
      // empty the list!
      this._list.Clear();
      return;
    }

    const count = this._list.Count();

    if (this._current._prev !== null) {
      this._current._prev._next = this._current._next;
    } else {
      if (this._list._head !== this._current) {
        throw new Error(
          "Invalid state: current node is not the head of the list"
        );
      }
      this._list._head = this._current._next;
    }

    if (this._current._next !== null) {
      this._current._next._prev = this._current._prev;
    } else {
      if (this._list._tail !== this._current) {
        throw new Error(
          "Invalid state: current node is not the tail of the list"
        );
      }
      this._list._tail = this._current._prev;
    }

    if (count - 1 !== this._list.Count()) {
      throw new Error(
        "Invalid state: list count did not decrease after removing current node"
      );
    }

    // NOTE! "current" is now not part of the list, but its _next and _prev still work for iterating off of it.
  }

  /**
   * Gets the next element in the iteration.
   * @returns The next element in the iteration, or null if the end of the list has been reached.
   */
  public Next(): T | null {
    if (this._current === null) {
      this._current = this._list._head;
    } else {
      this._current = this._current._next;
    }
    return this.Current();
  }
}

/**
 * A module containing utility functions for working with tables.
 */
export const table = {
  /**
   * Counts the number of elements in a table.
   * @param t The table to count elements in.
   * @param value The value to count. If undefined, counts all elements.
   * @returns The number of elements in the table.
   */
  count: function <T>(t: { [key: string]: T }, value?: T): number {
    let count = 0;
    for (const k in t) {
      if (Object.prototype.hasOwnProperty.call(t, k)) {
        if (value === undefined || t[k] === value) {
          count++;
        }
      }
    }
    return count;
  },

  /**
   * Sets a value in a table using a string key.
   * @param Table The table to set the value in.
   * @param Name The string key to use to set the value.
   * @param Value The value to set.
   */
  setfield: function (
    Table: { [key: string]: any },
    Name: string,
    Value: any
  ): void {
    if (typeof Table !== "object") {
      Table = globalThis;
      Name = Table;
      Value = Name;
    }

    let Concat = false;
    let Key = "";

    Name.replace(/([^\.]+)(\.*)/g, function (match, word, delimiter) {
      if (delimiter === ".") {
        if (Concat) {
          word = Key + word;
          Concat = false;
          Key = "";
        }
        if (Table === globalThis) {
          // using strict.lua have to declare global before using it
          globalThis[word] = undefined;
        }
        if (typeof Table[word] !== "object") {
          Table[word] = {};
        }
        Table = Table[word];
      } else {
        Key += word + delimiter;
        Concat = true;
      }
      return "";
    });

    if (Key === "") {
      Table.push(Value);
    } else {
      Table[Key] = Value;
    }
  },

  /**
   * Gets a value from a table using a string key.
   * @param Table The table to get the value from.
   * @param Name The string key to use to get the value.
   * @returns The value, or undefined if not found.
   */
  getfield: function (Table: { [key: string]: any }, Name: string): any {
    if (typeof Table !== "object") {
      Table = globalThis;
      Name = Table;
    }

    for (const w of Name.match(/[\w_]+/g) || []) {
      Table = Table[w];
      if (Table === undefined) {
        return undefined;
      }
    }

    return Table;
  },

  /**
   * Gets a value from a table using a string key and type checking.
   * @param Table The table to get the value from.
   * @param Type The type of the value to get.
   * @param Names The string keys to use to get the value.
   * @returns The value, or undefined if not found or not of the specified type.
   */
  typecheckedgetfield: function (
    Table: { [key: string]: any },
    Type: string,
    ...Names: string[]
  ): any {
    if (typeof Table !== "object") {
      return undefined;
    }

    for (const [i, Name] of Names.entries()) {
      if (i === Names.length - 1) {
        if (Type === undefined || typeof Table[Name] === Type) {
          return Table[Name];
        }
        return undefined;
      } else {
        if (typeof Table[Name] === "object") {
          Table = Table[Name];
        } else {
          return undefined;
        }
      }
    }
  },

  /**
   * Finds the key of a value in a table.
   * @param Table The table to search.
   * @param Name The name of the value to search for.
   * @returns The key of the value, or undefined if not found.
   */
  findfield: function (
    Table: { [key: string]: any },
    Name: string
  ): string | undefined {
    let indx = "";

    for (const [i, v] of Object.entries(Table)) {
      if (i === Name) {
        return i;
      }
      if (typeof v === "object") {
        indx = table.findfield(v, Name) || "";
        if (indx) {
          return i + "." + indx;
        }
      }
    }
    return undefined;
  },

  /**
   * Finds the path to a value in a table using string keys.
   * @param Table The table to search.
   * @param Names The string keys to use to search for the value.
   * @param indx The current index in the string keys.
   * @returns The path to the value, or undefined if not found.
   */
  findpath: function (
    Table: { [key: string]: any },
    Names: string | string[],
    indx = 1
  ): string | undefined {
    let path = "";
    if (typeof Names === "string") {
      Names = [Names];
    }

    for (const [i, v] of Object.entries(Table)) {
      if (i === Names[indx]) {
        if (indx === Names.length - 1) {
          return i;
        } else if (typeof v === "object") {
          path = table.findpath(v, Names, indx + 1) || "";
          if (path) {
            return i + "." + path;
          } else {
            return undefined;
          }
        }
      }
      if (typeof v === "object") {
        path = table.findpath(v, Names, indx) || "";
        if (path) {
          return i + "." + path;
        }
      }
    }
    return undefined;
  },

  /**
   * Checks if two tables have identical keys.
   * @param a The first table to compare.
   * @param b The second table to compare.
   * @returns True if the tables have identical keys, false otherwise.
   */
  keysareidentical: function (
    a: { [key: string]: any },
    b: { [key: string]: any }
  ): boolean {
    for (const k in a) {
      if (b[k] === undefined) {
        return false;
      }
    }
    for (const k in b) {
      if (a[k] === undefined) {
        return false;
      }
    }
    return true;
  },
};

/**
 * Tracks memory usage.
 */
export function TrackMem(): void {
  collectgarbage();
  collectgarbage("stop");
  TheSim.SetMemoryTracking(true);
}

/**
 * Dumps memory statistics.
 */
export function DumpMem(): void {
  TheSim.DumpMemoryStats();
  mem_report();
  collectgarbage("restart");
  TheSim.SetMemoryTracking(false);
}

/**
 * Checks if a bit is set in a number.
 * @param x The number to check.
 * @param b The bit to check.
 * @returns True if the bit is set, false otherwise.
 */
export function checkbit(x: number, b: number): boolean {
  return bit.band(x, b) > 0;
}

/**
 * Sets a bit in a number.
 * @param x The number to set the bit in.
 * @param b The bit to set.
 * @returns The number with the bit set.
 */
export function setbit(x: number, b: number): number {
  return bit.bor(x, b);
}

/**
 * Clears a bit in a number.
 * @param x The number to clear the bit in.
 * @param b The bit to clear.
 * @returns The number with the bit cleared.
 */
export function clearbit(x: number, b: number): number {
  return bit.bxor(bit.bor(x, b), b);
}

/**
 * Determines if a point is within a certain angle of a forward vector.
 *
 * @param position The position of the forward vector.
 * @param forward The forward vector.
 * @param width The total width of the region of interest, in radians.
 * @param testPos The position to test.
 * @returns True if the test position is within .5 * width of forward on either side, false otherwise.
 */
export function IsWithinAngle(
  position: Vector3,
  forward: Vector3,
  width: number,
  testPos: Vector3
): boolean {
  // Get vector from position to testPos (testVec)
  const testVec = testPos.sub(position);

  // Test angle from forward to testVec (testAngle)
  const testAngle = Math.acos(
    testVec.Dot(forward) / (testVec.Length() * forward.Length())
  );

  // Return true if testAngle is <= +/- .5 * width
  return Math.abs(testAngle) <= 0.5 * Math.abs(width);
}

/**
 * Given a number of segments, circle radius, circle center point, and point to snap, returns a snapped position and angle on a circle's edge.
 * @param segments The number of segments in the circle.
 * @param radius The radius of the circle.
 * @param base_pt The center point of the circle.
 * @param pt The point to snap.
 * @param angle The angle to start from.
 * @returns A tuple containing the snapped position and angle.
 */
export function GetCircleEdgeSnapTransform(
  segments: number,
  radius: number,
  base_pt: Vector3,
  pt: Vector3,
  angle?: number
): [Vector3, number] {
  const segmentangle = segments > 0 ? 360 / segments : 360;
  let snap_point = base_pt.add(new Vector3(radius, 0, 0));
  let snap_angle = 0;
  const start = angle || 0;

  for (
    let midangle = -start;
    midangle < 360 - start;
    midangle += segmentangle
  ) {
    const facing = new Vector3(
      Math.cos(midangle / RADIANS),
      0,
      Math.sin(midangle / RADIANS)
    );
    if (IsWithinAngle(base_pt, facing, segmentangle / RADIANS, pt)) {
      snap_point = base_pt.add(facing.mul(radius));
      snap_angle = midangle;
      break;
    }
  }

  return [snap_point, snap_angle];
}

/**
 * Snaps an object to the edge of a boat.
 * @param inst The object to snap.
 * @param boat The boat to snap to.
 * @param override_pt The point to snap to, if different from the object's position.
 */
export function SnapToBoatEdge(
  inst: Instance,
  boat: Instance,
  override_pt?: Vector3
): void {
  if (!boat) {
    return;
  }

  const pt = override_pt || inst.GetPosition();
  const boatpos = boat.GetPosition();
  const radius = boat.components.boatringdata?.GetRadius() - 0.1 || 0;
  const boatsegments = boat.components.boatringdata?.GetNumSegments() || 0;
  const boatangle = boat.Transform.GetRotation();

  const [snap_point, snap_angle] = GetCircleEdgeSnapTransform(
    boatsegments,
    radius,
    boatpos,
    pt,
    boatangle
  );
  if (snap_point) {
    inst.Transform.SetPosition(snap_point.x, 0, snap_point.z);
    inst.Transform.SetRotation(-snap_angle + 90); // Need to offset snap_angle here to make the object show in the correct orientation
  } else {
    // point is outside of radius; set original position
    inst.Transform.SetPosition(pt);
  }
}

/**
 * Returns the angle from the boat's position to (x, z), in radians.
 * @param boat The boat to calculate the angle from.
 * @param x The x coordinate to calculate the angle to.
 * @param z The z coordinate to calculate the angle to.
 * @returns The angle in radians.
 */
export function GetAngleFromBoat(
  boat: Instance,
  x: number,
  z: number
): number | undefined {
  if (!boat) {
    return undefined;
  }
  const boatpos = boat.GetPosition();
  return Math.atan2(z - boatpos.z, x - boatpos.x);
}

/**
 * An array of characters from 0 to 255.
 */
let Chars_: string[] = [];

for (let Loop = 0; Loop < 256; Loop++) {
  Chars_[Loop + 1] = String.fromCharCode(Loop);
}

let String_ = Chars_.join("");

let Built = { ["."]: Chars_ };

/**
 * Adds a lookup table for a given character set.
 * @param charSet The character set to add a lookup table for.
 * @returns The lookup table for the character set.
 */
export function addLookup(charSet: string): string[] {
  const substitute = String.replace(new RegExp(`[^${charSet}]`, "g"), "");
  const lookup: string[] = [];

  for (let loop = 0; loop < substitute.length; loop++) {
    lookup[loop] = substitute.charAt(loop);
  }

  Built[charSet] = lookup;

  return lookup;
}

/**
 * Generates a random string of a given length and character set.
 * @param length The length of the string to generate.
 * @param charSet The character set to use for the string. Defaults to '.'.
 * @returns The generated string.
 */
export function random(length: number, charSet: string = "."): string {
  const CharSet = charSet || ".";

  if (CharSet === "") {
    return "";
  } else {
    const Result: string[] = [];
    const Lookup: string[] = Built[CharSet] || addLookup(CharSet);
    const Range = Lookup.length;

    for (let Loop = 1; Loop <= length; Loop++) {
      Result[Loop] = Lookup[Math.floor(Math.random() * Range)];
    }

    return Result.join("");
  }
}

if (APP_VERSION !== "MAPGEN") {
  // for string utf8
}

/**
 * Returns the 0-255 color of a hex code.
 * @param hex The hex code to convert to RGB.
 * @returns An array of three numbers representing the red, green, and blue values of the color.
 */
export function HexToRGB(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Returns the 0.0 - 1.0 color from r, g, b parameters.
 * @param r The red value of the color, between 0 and 255.
 * @param g The green value of the color, between 0 and 255.
 * @param b The blue value of the color, between 0 and 255.
 * @returns An array of three numbers representing the red, green, and blue values of the color as percentages.
 */
export function RGBToPercentColor(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  return [r / 255, g / 255, b / 255];
}

/**
 * Returns the 0.0 - 1.0 color from a hex parameter.
 * @param hex The hex code to convert to a percentage color.
 * @returns An array of three numbers representing the red, green, and blue values of the color as percentages.
 */
export function HexToPercentColor(hex: string): [number, number, number] {
  return RGBToPercentColor(...HexToRGB(hex));
}

/**
 * Calculates the diminishing returns of a value based on a base delta.
 * @param current The current value.
 * @param basedelta The base delta value.
 * @returns The new value after applying the diminishing returns.
 */
export function CalcDiminishingReturns(
  current: number,
  basedelta: number
): number {
  const dampen = (3 * basedelta) / (current + 3 * basedelta);
  const dcharge = dampen * basedelta * 0.5 * (1 + Math.random() * dampen);
  return current + dcharge;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Calculates the squared distance between two 2D points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The squared distance between the two points.
 */
export function Dist2dSq(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

/**
 * Calculates the squared distance between a point and a line segment defined by two points.
 * @param p The point to calculate the distance from.
 * @param v1 The first point defining the line segment.
 * @param v2 The second point defining the line segment.
 * @returns The squared distance between the point and the line segment.
 */
export function DistPointToSegmentXYSq(p: Point, v1: Point, v2: Point): number {
  const l2 = Dist2dSq(v1, v2);
  if (l2 === 0) {
    return Dist2dSq(p, v1);
  }
  const t = ((p.x - v1.x) * (v2.x - v1.x) + (p.y - v1.y) * (v2.y - v1.y)) / l2;
  if (t < 0) {
    return Dist2dSq(p, v1);
  }
  if (t > 1) {
    return Dist2dSq(p, v2);
  }
  const intersection = {
    x: v1.x + t * (v2.x - v1.x),
    y: v1.y + t * (v2.y - v1.y),
  };
  return Dist2dSq(p, intersection);
}

/**
 * Generates an ordered index for a table.
 * @param t The table to generate the index for.
 * @returns An array of keys from the table in sorted order.
 */
export function __genOrderedIndex<T>(t: Record<string, T>): string[] {
  const orderedIndex: string[] = [];
  for (const key in t) {
    if (t.hasOwnProperty(key)) {
      orderedIndex.push(key);
    }
  }
  orderedIndex.sort();
  return orderedIndex;
}

interface Table<T> {
  [key: string]: T;
  __orderedIndex?: string[];
}

/**
 * Returns the next key-value pair in a table in alphabetical order of keys.
 * @param t The table to iterate over.
 * @param state The current state of the iteration.
 * @returns An array containing the next key-value pair in the table, or undefined if there are no more pairs.
 */
export function orderedNext<T>(
  t: Table<T>,
  state?: string
): [string, T] | undefined {
  let key: string | undefined = undefined;
  if (state === undefined) {
    t.__orderedIndex = __genOrderedIndex(t);
    key = t.__orderedIndex[0];
  } else {
    const index = t.__orderedIndex?.indexOf(state);
    if (
      index !== undefined &&
      index !== -1 &&
      index < t.__orderedIndex.length - 1
    ) {
      key = t.__orderedIndex[index + 1];
    }
  }
  if (key !== undefined) {
    return [key, t[key]];
  }
  t.__orderedIndex = undefined;
  return undefined;
}

/**
 * Zips and encodes a Lua table as a string.
 * @param data The Lua table to zip and encode.
 * @returns The zipped and encoded string.
 */
export function ZipAndEncodeString(data: any): string {
  return TheSim.ZipAndEncodeString(DataDumper(data, null, true));
}

/**
 * Zips and encodes a Lua table as a save data object.
 * @param data The Lua table to zip and encode.
 * @returns An object containing the zipped and encoded string.
 */
export function ZipAndEncodeSaveData(data: any): { str: string } {
  return { str: ZipAndEncodeString(data) };
}

/**
 * Decodes and unzips a string as a Lua table.
 * @param str The string to decode and unzip.
 * @returns The decoded and unzipped Lua table, or an empty table if decoding or unzipping fails.
 */
export function DecodeAndUnzipString(str: string): any {
  if (typeof str === "string") {
    const [success, savedata] = RunInSandbox(TheSim.DecodeAndUnzipString(str));
    if (success) {
      return savedata;
    } else {
      return {};
    }
  }
}

/**
 * Decodes and unzips a save data object as a Lua table.
 * @param data The save data object to decode and unzip.
 * @returns The decoded and unzipped Lua table, or an empty table if decoding or unzipping fails.
 */
export function DecodeAndUnzipSaveData(data: { str?: string }): any {
  return DecodeAndUnzipString(data?.str ?? "");
}

/**
 * Executes a function or returns a value.
 * @param funcOrVal - The function or value to execute or return.
 * @param args - The arguments to pass to the function (if `funcOrVal` is a function).
 * @returns The result of the function or the value.
 */
export function FunctionOrValue<T>(
  funcOrVal: T | ((...args: any[]) => T),
  ...args: any[]
): T {
  if (typeof funcOrVal === "function") {
    return (funcOrVal as (...args: any[]) => T)(...args);
  }
  return funcOrVal;
}

/**
 * Applies a local word filter to a text string.
 * @param text The text string to filter.
 * @param text_filter_context The context in which the text is being filtered.
 * @param net_id The network ID of the player sending the text.
 * @returns The filtered text string.
 */
export function ApplyLocalWordFilter(
  text: string,
  text_filter_context: number,
  net_id: number
): string {
  if (
    text_filter_context !== TEXT_FILTER_CTX_GAME &&
    (Profile.GetProfanityFilterChatEnabled() || TheSim.IsSteamChinaClient())
  ) {
    text =
      TheSim.ApplyLocalWordFilter(text, text_filter_context, net_id) || text;
  }
  return text;
}

//jcheng taken from griftlands
//START

/**
 * Returns a raw string representation of a value.
 * @param t The value to convert to a string.
 * @returns The raw string representation of the value.
 */
export function rawstring(t: any): string {
  if (typeof t === "object") {
    const mt = Object.getPrototypeOf(t);
    if (mt) {
      // Bypass the toString method by temporarily removing the prototype
      const originalMt = Object.getPrototypeOf(t);
      Object.setPrototypeOf(t, null);
      const s = t.toString();
      Object.setPrototypeOf(t, originalMt);
      return s;
    }
  }
  return String(t);
}

/**
 * Sorts two values for use in `sorted_pairs`.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns A boolean indicating whether `a` is less than `b`.
 */
function StringSort(a: any, b: any): boolean {
  if (typeof a === "number" && typeof b === "number") {
    return a < b;
  } else {
    return String(a) < String(b);
  }
}

/**
 * Iterates over a table's key-value pairs in sorted order.
 * @param t The table to iterate over.
 * @param fn An optional sorting function to use.
 * @returns An iterator function and a state object.
 */
export function sorted_pairs(
  t: any,
  fn?: (a: any, b: any) => boolean
): () => [any, any] {
  const sortedKeys = Object.keys(t).sort(fn || StringSort);
  let i = 0;
  return function () {
    if (i < sortedKeys.length) {
      const key = sortedKeys[i];
      i++;
      return [key, t[key]];
    }
  };
}

/**
 * Generates an error message with a stack trace.
 * @param err The error message.
 * @returns The error message with a stack trace.
 */
export function generic_error(err: any): string {
  return `${String(err)}\n${debugstack()}`;
}

//END
