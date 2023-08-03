/**
 * Definition of a Pocket Dimension Container.
 */
interface PocketDimensionContainerDef {
  /** The name of the container. */
  name: string;
  /** The prefab name of the container. */
  prefab: string;
  /** The UI animation zip file path of the container. */
  ui: string;
  /** The widget name of the container. */
  widgetname: string;
  /** The tags associated with the container. */
  tags: string[];
}

/**
 * Definition of all Pocket Dimension Containers.
 */
interface PocketDimensionContainerDefs {
  /** An array of all Pocket Dimension Container definitions. */
  POCKETDIMENSIONCONTAINER_DEFS: PocketDimensionContainerDef[];
}

/**
 * All Pocket Dimension Container definitions.
 */
const POCKETDIMENSIONCONTAINER_DEFS: PocketDimensionContainerDef[] = [
  {
    name: "shadow",
    prefab: "shadow_container",
    ui: "anim/ui_portal_shadow_3x4.zip",
    widgetname: "shadow_container",
    tags: ["spoiler"],
  },
];

export default { POCKETDIMENSIONCONTAINER_DEFS };
