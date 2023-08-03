import { BufferedAction } from "./bufferedaction";
import { DebugTools } from "./debugtools";
import { distsq } from "./util";
import { VecUtil } from "./vecutil";
import { Embarker } from "./components/embarker";
import { Vector3 } from "vector3";
import { TheWorld } from "API/System";
/**
 * Checks if the distance between the doer and the target is within a default range of 16 units.
 * @param doer The entity performing the action.
 * @param target The entity being targeted by the action.
 * @returns True if the distance between the doer and the target is within 16 units, false otherwise.
 * If the target is null, returns undefined.
 */
function DefaultRangeCheck(doer: any, target: any): boolean | undefined {
  if (target == null) {
    return undefined;
  }
  const targetPos = target.Transform.GetWorldPosition();
  const doerPos = doer.Transform.GetWorldPosition();
  const dst = distsq(targetPos.x, targetPos.z, doerPos.x, doerPos.z);
  return dst <= 16;
}

/**
 * Checks if a destination is within range for fishing in the ocean.
 * @param doer The entity doing the fishing.
 * @param dest The destination to check.
 * @returns A boolean indicating whether the destination is within range for fishing in the ocean.
 */
function CheckFishingOceanRange(doer: any, dest: any): boolean {
  const doer_pos = doer.GetPosition();
  const target_pos = new Vector3(dest.GetPoint());
  const dir = target_pos.sub(doer_pos);

  const test_pt = doer_pos.add(
    dir.Normalize().mul(doer.GetPhysicsRadius(0) + 0.25)
  );

  if (
    TheWorld.Map.IsVisualGroundAtPoint(test_pt.x, 0, test_pt.z) ||
    TheWorld.Map.GetPlatformAtPoint(test_pt.x, test_pt.z) !== null
  ) {
    return false;
  } else {
    return true;
  }
}

/**
 * Checks if a given destination is within range of a doer.
 * @param {Entity} doer - The entity performing the check.
 * @param {Entity} dest - The destination entity to check.
 * @returns {boolean} Whether or not the destination is within range of the doer.
 */
function CheckRowRange(doer: Entity, dest: Entity): boolean {
  const doer_pos = doer.GetPosition();
  const target_pos = new Vector3(dest.GetPoint());
  const dir = target_pos.sub(doer_pos);

  const test_pt = doer_pos.add(
    dir.Normalize().mul(doer.GetPhysicsRadius(0) + 0.25)
  );

  if (TheWorld.Map.GetPlatformAtPoint(test_pt.x, test_pt.z) !== null) {
    return false;
  } else {
    return true;
  }
}

/**
 * Checks if a given destination is within range of a doer.
 * @param {Entity} doer - The entity performing the check.
 * @param {Entity} dest - The destination entity to check.
 * @returns {boolean} Whether or not the destination is within range of the doer.
 */
function CheckIsOnPlatform(doer: Entity, dest: Entity): boolean {
  return doer.GetCurrentPlatform() != null;
}

/**
 * Checks if a given destination is within range of a doer for ocean fishing.
 * @param {Entity} doer - The entity performing the check.
 * @param {Entity} dest - The destination entity to check.
 * @returns {boolean} Whether or not the destination is within range of the doer for ocean fishing.
 */
export function CheckOceanFishingCastRange(
  doer: Entity,
  dest: Entity
): boolean {
  const doer_pos = doer.GetPosition();
  const target_pos = new Vector3(dest.GetPoint());
  const dir = target_pos.sub(doer_pos);

  const test_pt = doer_pos.add(
    dir.Normalize().mul(doer.GetPhysicsRadius(0) + 0.25)
  );

  if (
    TheWorld.Map.IsVisualGroundAtPoint(test_pt.x, 0, test_pt.z) ||
    TheWorld.Map.GetPlatformAtPoint(test_pt.x, test_pt.z) !== null
  ) {
    return false;
  } else {
    return true;
  }
}
