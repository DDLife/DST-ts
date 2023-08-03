import { PREFAB_SKINS } from "prefabskins";

/**
 * Represents a prefab object.
 */
export class Prefab {
  name: string;
  desc: string;
  fn: Function;
  assets: Asset[];
  deps: string[];
  force_path_search: boolean;

  /**
   * Creates a new Prefab object.
   * @param name - The name of the prefab.
   * @param fn - The function that creates the prefab.
   * @param assets - The assets required by the prefab.
   * @param deps - The dependencies of the prefab.
   * @param force_path_search - Whether to force a path search for the prefab.
   */
  constructor(
    name: string,
    fn: Function,
    assets: Asset[] = [],
    deps: string[] = [],
    force_path_search: boolean = false
  ) {
    this.name = name.substring(name.lastIndexOf("/") + 1);
    this.desc = "";
    this.fn = fn;
    this.assets = assets;
    this.deps = deps;
    this.force_path_search = force_path_search;

    const prefabSkins = PREFAB_SKINS[this.name];
    if (prefabSkins) {
      for (const prefabSkin of prefabSkins) {
        this.deps.push(prefabSkin);
      }
    }
  }

  /**
   * Returns a string representation of the Prefab object.
   * @returns A string representation of the Prefab object.
   */
  toString(): string {
    return `Prefab ${this.name} - ${this.desc}`;
  }
}

/**
 * Represents an asset required by a prefab.
 */
export class Asset {
  type: string;
  file: string;
  param: any;

  /**
   * Creates a new Asset object.
   * @param type - The type of the asset.
   * @param file - The file path of the asset.
   * @param param - The parameter of the asset.
   */
  constructor(type: string, file: string, param: any) {
    this.type = type;
    this.file = file;
    this.param = param;
  }
}
