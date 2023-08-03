/**
 * Represents a buffered action that can be performed by a character in the game.
 */
export class BufferedAction {
  doer: any;
  target: any;
  initialtargetowner: any;
  action: any;
  invobject: any;
  doerownsobject: boolean;
  pos: any;
  rotation: number;
  onsuccess: any[];
  onfail: any[];
  recipe: any;
  options: any;
  distance: any;
  forced: any;
  autoequipped: any;
  skin: any;

  /**
   * Creates a new `BufferedAction` instance.
   * @param doer The character performing the action.
   * @param target The target of the action.
   * @param action The action to perform.
   * @param invobject The inventory object used to perform the action.
   * @param pos The position of the action.
   * @param recipe The recipe used to perform the action.
   * @param distance The distance to the target.
   * @param forced Whether the action is forced.
   * @param rotation The rotation of the action.
   */
  constructor(
    doer: any,
    target: any,
    action: any,
    invobject: any,
    pos: any,
    recipe: any,
    distance: any,
    forced: any,
    rotation: number
  ) {
    this.doer = doer;
    this.target = target;
    this.initialtargetowner =
      target !== null &&
      target.components.inventoryitem !== null &&
      target.components.inventoryitem.owner !== null
        ? target.components.inventoryitem.owner
        : null;
    this.action = action;
    this.invobject = invobject;
    this.doerownsobject =
      doer !== null &&
      invobject !== null &&
      invobject.replica.inventoryitem !== null &&
      invobject.replica.inventoryitem.IsHeldBy(doer);
    this.pos = pos !== null ? new DynamicPosition(pos) : null;
    this.rotation = rotation || 0;
    this.onsuccess = [];
    this.onfail = [];
    this.recipe = recipe;
    this.options = {};
    this.distance = distance || action.distance;
    this.forced = forced;
    this.autoequipped = null;
    this.skin = null;
  }

  /**
   * Performs the action.
   * @returns A tuple containing a boolean indicating whether the action was successful and a reason for failure if applicable.
   */
  Do() {
    if (!this.IsValid()) {
      return [false, null];
    }
    const [success, reason] = this.action.fn(this);
    if (success) {
      if (this.invobject !== null && this.invobject.IsValid()) {
        this.invobject.OnUsedAsItem(this.action, this.doer, this.target);
      }
      this.Succeed();
    } else {
      this.Fail();
    }
    return [success, reason];
  }

  /**
   * Checks whether the action is valid.
   * @returns A boolean indicating whether the action is valid.
   */
  IsValid() {
    return (
      (this.invobject === null || this.invobject.IsValid()) &&
      (this.doer === null ||
        (this.doer.IsValid() &&
          (!this.autoequipped ||
            this.doer.replica.inventory.GetActiveItem() === null))) &&
      (this.target === null ||
        (this.target.IsValid() &&
          this.initialtargetowner ===
            (this.target.components.inventoryitem !== null &&
            this.target.components.inventoryitem.owner !== null
              ? this.target.components.inventoryitem.owner
              : null))) &&
      (this.pos === null ||
        this.pos.walkable_platform === null ||
        this.pos.walkable_platform.IsValid()) &&
      (!this.doerownsobject ||
        (this.doer !== null &&
          this.invobject !== null &&
          this.invobject.replica.inventoryitem !== null &&
          this.invobject.replica.inventoryitem.IsHeldBy(this.doer))) &&
      (this.validfn === null || this.validfn(this)) &&
      (!TheWorld.ismastersim ||
        this.action.validfn === null ||
        this.action.validfn(this))
    );
  }

  /**
   * Tests whether the action can be started.
   * @returns A boolean indicating whether the action can be started.
   */
  TestForStart() {
    return this.IsValid();
  }

  /**
   * Gets the action string.
   * @returns A tuple containing the action string and a boolean indicating whether the string was overridden.
   */
  GetActionString() {
    let str = null;
    let overriden = null;
    if (this.doer !== null && this.doer.ActionStringOverride !== null) {
      [str, overriden] = this.doer.ActionStringOverride(this);
    }
    if (str !== null) {
      return [str, overriden];
    } else if (this.action.stroverridefn !== null) {
      str = this.action.stroverridefn(this);
      if (str !== null) {
        return [str, true];
      }
    }
    return [
      GetActionString(
        this.action.id,
        this.action.strfn !== null ? this.action.strfn(this) : null
      ),
      false,
    ];
  }

  /**
   * Adds a function to be called when the action fails.
   * @param fn The function to add.
   */
  AddFailAction(fn: any) {
    this.onfail.push(fn);
  }

  /**
   * Adds a function to be called when the action succeeds.
   * @param fn The function to add.
   */
  AddSuccessAction(fn: any) {
    this.onsuccess.push(fn);
  }

  /**
   * Calls all success functions and clears the success and fail function arrays.
   */
  Succeed() {
    for (const v of this.onsuccess) {
      v();
    }
    this.onsuccess = [];
    this.onfail = [];
  }

  /**
   * Gets the action point.
   * @returns The action point.
   */
  GetActionPoint() {
    return this.pos !== null ? this.pos.GetPosition() : null;
  }

  /**
   * Gets the dynamic action point.
   * @returns The dynamic action point.
   */
  GetDynamicActionPoint() {
    return this.pos;
  }

  /**
   * Sets the action point.
   * @param pt The new action point.
   */
  SetActionPoint(pt: any) {
    this.pos = new DynamicPosition(pt);
  }

  /**
   * Calls all fail functions and clears the success and fail function arrays.
   */
  Fail() {
    for (const v of this.onfail) {
      v();
    }
    this.onsuccess = [];
    this.onfail = [];
  }
}
