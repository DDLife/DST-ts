/**
 * This module exports a function that adds unique entities that must exist for all worlds and shards before they get instantiated.
 *
 * @packageDocumentation
 */

import prefabPocket from "prefabs/pocketdimensioncontainer_defs";

/**
 * An interface representing the position of an entity.
 */
interface EntityPosition {
  x: number;
  z: number;
}

/**
 * An interface representing a table of entities.
 */
interface EntityTable {
  [key: string]: EntityPosition[];
}

/**
 * An interface representing the save data.
 */
interface SaveData {
  ents: EntityTable;
}

/**
 * Adds unique entities that must exist for all worlds and shards before they get instantiated.
 * @param savedata - The save data.
 */
function AddWorldEntities(savedata: SaveData): void {
  // NOTES(JBK): Inject unique entities that must exist for all worlds and shards here before they get instantiated.
  // There is no checking inherently made here for if an entity already exists you will have to do this yourself.
  const enttable: EntityTable = savedata.ents;

  // Pocket dimension containers, one of each type per world is expected.
  const POCKETDIMENSIONCONTAINER_DEFS =
    prefabPocket.POCKETDIMENSIONCONTAINER_DEFS;
  for (const v of POCKETDIMENSIONCONTAINER_DEFS) {
    const prefab = v.prefab;
    const ents = enttable[prefab];
    if (Object.keys(ents).length === 0) {
      enttable[prefab] = [{ x: 0, z: 0 }]; // Position data for the save to go through.
    }
  }
}

export default { AddWorldEntities };
