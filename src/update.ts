/**
 * This file contains functions related to updating the game state.
 *
 * `Update` function is called every frame and updates all entities that have an `OnUpdate` method.
 *
 * `LongUpdate` function is called every 16 frames and updates all entities that have a `LongUpdate` method.
 *
 * `StaticUpdate` function is called every frame when the server is paused and updates all static components.
 *
 * `PostUpdate` function is called after `Update` and updates all emitter managers and the update looper.
 *
 * `PostPhysicsWallUpdate` function is called after physics wall update and updates the walkable platform manager.
 *
 * `RegisterStaticComponentLongUpdate` function registers a function to be called during `LongUpdate` for a specific component class.
 *
 * `RegisterStaticComponentUpdate` function registers a function to be called during `StaticUpdate` for a specific component class.
 *
 * `StaticComponentLongUpdates` is an object containing all registered long update functions for static components.
 *
 * `StaticComponentUpdates` is an object containing all registered update functions for static components.
 *
 * `last_static_tick_seen` is the last static tick seen by the server.
 *
 * `last_tick_seen` is the last tick seen by the server.
 */

import "API/System";
function WallUpdate(dt: number): void {
  const server_paused = TheNet.IsServerPaused();

  TheSim.ProfilerPush("RPC queue");
  HandleRPCQueue();
  TheSim.ProfilerPop();

  HandleUserCmdQueue();

  if (TheFocalPoint !== null) {
    TheSim.SetActiveAreaCenterpoint(TheFocalPoint.Transform.GetWorldPosition());
  } else {
    TheSim.SetActiveAreaCenterpoint(0, 0, 0);
  }

  TheSim.ProfilerPush("updating wall components");
  for (const [k, v] of pairs(WallUpdatingEnts)) {
    if (v.wallupdatecomponents) {
      for (const cmp of pairs(v.wallupdatecomponents)) {
        if (cmp.OnWallUpdate) {
          cmp.OnWallUpdate(dt);
        }
      }
    }
  }
  if (next(NewWallUpdatingEnts) !== null) {
    for (const [k, v] of pairs(NewWallUpdatingEnts)) {
      WallUpdatingEnts[k] = v;
    }
    NewWallUpdatingEnts = {};
  }
  TheSim.ProfilerPop();

  TheSim.ProfilerPush("mixer");
  TheMixer.Update(dt);
  TheSim.ProfilerPop();

  TheSim.ProfilerPush("camera");
  TheCamera.Update(dt, server_paused);
  TheSim.ProfilerPop();

  CheckForUpsellTimeout(dt);

  if (!SimTearingDown) {
    TheSim.ProfilerPush("input");
    TheInput.OnUpdate();
    TheSim.ProfilerPop();
  }

  TheSim.ProfilerPush("fe");
  if (HashesMessageState === "SHOW_WARNING") {
    ShowBadHashUI(); // This sets global_error_widget.
  }
  if (global_error_widget) {
    TheFrontEnd.OnRenderImGui(dt);

    global_error_widget.OnUpdate(dt);
  } else {
    TheFrontEnd.Update(dt);
  }
  TheSim.ProfilerPop();

  if (!server_paused) {
    TheSim.ProfilerPush("shade");
    ShadeEffectUpdate(dt);
    TheSim.ProfilerPop();
  }
}

import "components/updatelooper";

function PostUpdate(dt: number): void {
  EmitterManager.PostUpdate();
  UpdateLooper_PostUpdate();
}

function PostPhysicsWallUpdate(dt: number): void {
  if (TheWorld !== null) {
    const walkable_platform_manager =
      TheWorld.components.walkableplatformmanager;
    if (walkable_platform_manager !== null) {
      walkable_platform_manager.PostUpdate(dt);
    }
  }
}

const StaticComponentLongUpdates: { [key: string]: Function } = {};
function RegisterStaticComponentLongUpdate(
  classname: string,
  fn: Function
): void {
  StaticComponentLongUpdates[classname] = fn;
}

const StaticComponentUpdates: { [key: string]: Function } = {};
function RegisterStaticComponentUpdate(classname: string, fn: Function): void {
  StaticComponentUpdates[classname] = fn;
}

let last_static_tick_seen = -1;
function StaticUpdate(dt: number): void {
  const static_tick = TheSim.GetStaticTick();
  if (static_tick <= last_static_tick_seen) {
    print("Saw this before");
    return;
  }

  TheSim.ProfilerPush("staticScheduler");
  for (let i = last_static_tick_seen + 1; i <= static_tick; i++) {
    RunStaticScheduler(i);
  }
  TheSim.ProfilerPop();

  TickRPCQueue();

  if (TheNet.IsServerPaused()) {
    //only update static components when paused.
    TheSim.ProfilerPush("static updating components");
    for (const [k, v] of pairs(StaticUpdatingEnts)) {
      if (v.updatecomponents) {
        for (const cmp of pairs(v.updatecomponents)) {
          if (cmp.OnStaticUpdate && !StopUpdatingComponents[cmp]) {
            cmp.OnStaticUpdate(0); //DT is always 0 for static component updates
          }
        }
      }
    }

    if (next(NewStaticUpdatingEnts) !== null) {
      for (const [k, v] of pairs(NewStaticUpdatingEnts)) {
        StaticUpdatingEnts[k] = v;
      }
      NewStaticUpdatingEnts = {};
    }

    if (next(StopUpdatingComponents) !== null) {
      for (const [k, v] of pairs(StopUpdatingComponents)) {
        v.StopUpdatingComponent_Deferred(k);
      }
      StopUpdatingComponents = {};
    }

    TheSim.ProfilerPop();

    for (let i = last_static_tick_seen + 1; i <= static_tick; i++) {
      TheSim.ProfilerPush("LuaEventSG");
      SGManager.UpdateEvents();
      TheSim.ProfilerPop();
    }
  }

  last_static_tick_seen = static_tick;
}

let last_tick_seen = -1;

function Update(dt: number): void {
  HandleClassInstanceTracking();
  CheckDemoTimeout();

  assert(!TheNet.IsServerPaused(), "Update() called on paused server!");

  const tick = TheSim.GetTick();
  if (tick <= last_tick_seen) {
    print("Saw this before");
    return;
  }

  TheSim.ProfilerPush("scheduler");
  for (let i = last_tick_seen + 1; i <= tick; i++) {
    RunScheduler(i);
  }
  TheSim.ProfilerPop();

  if (SimShuttingDown) {
    return;
  }

  TheSim.ProfilerPush("static components");
  for (const [k, v] of pairs(StaticComponentUpdates)) {
    v(dt);
  }
  TheSim.ProfilerPop();

  TheSim.ProfilerPush("updating components");
  for (const [k, v] of pairs(UpdatingEnts)) {
    if (v.updatecomponents) {
      for (const cmp of pairs(v.updatecomponents)) {
        if (cmp.OnUpdate && !StopUpdatingComponents[cmp]) {
          cmp.OnUpdate(dt);
        }
      }
    }
  }

  if (next(NewUpdatingEnts) !== null) {
    for (const [k, v] of pairs(NewUpdatingEnts)) {
      UpdatingEnts[k] = v;
    }
    NewUpdatingEnts = {};
  }

  if (next(StopUpdatingComponents) !== null) {
    for (const [k, v] of pairs(StopUpdatingComponents)) {
      v.StopUpdatingComponent_Deferred(k);
    }
    StopUpdatingComponents = {};
  }

  TheSim.ProfilerPop();

  for (let i = last_tick_seen + 1; i <= tick; i++) {
    TheSim.ProfilerPush("LuaSG");
    SGManager.Update(i);
    TheSim.ProfilerPop();

    TheSim.ProfilerPush("LuaBrain");
    BrainManager.Update(i);
    TheSim.ProfilerPop();
  }

  last_tick_seen = tick;
}

function LongUpdate(dt: number, ignore_player: boolean): void {
  for (const [k, v] of pairs(StaticComponentLongUpdates)) {
    v(dt);
  }

  if (ignore_player) {
    for (const [i, v] of ipairs(AllPlayers)) {
      if (v.components.beard) {
        v.components.beard.pause = true;
      }
    }

    for (const [k, v] of pairs(Ents)) {
      let should_ignore = false;

      if (v.components.inventoryitem !== null) {
        const grand_owner = v.components.inventoryitem.GetGrandOwner();
        if (
          grand_owner !== null &&
          (grand_owner.HasTag("player") ||
            (grand_owner.components.container &&
              grand_owner.components.follower &&
              grand_owner.components.follower.GetLeader() &&
              grand_owner.components.follower.GetLeader().HasTag("player")))
        ) {
          should_ignore = true;
        }
      }

      if (
        !should_ignore &&
        !v.HasTag("player") &&
        (!v.components.follower ||
          !v.components.follower.GetLeader() ||
          !v.components.follower.GetLeader().HasTag("player"))
      ) {
        v.LongUpdate(dt);
      }
    }

    for (const [i, v] of ipairs(AllPlayers)) {
      if (v.components.beard) {
        v.components.beard.pause = null;
      }
    }
  } else {
    for (const [k, v] of pairs(Ents)) {
      v.LongUpdate(dt);
    }
  }
}
