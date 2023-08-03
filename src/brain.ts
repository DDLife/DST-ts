class BrainWrangler {
  instances: Record<string, any> = {};
  updaters: Record<string, any> = {};
  tickwaiters: Record<string, any> = {};
  hibernaters: Record<string, any> = {};

  OnRemoveEntity(inst: any) {
    if (inst.brain && this.instances[inst.brain]) {
      this.RemoveInstance(inst.brain);
    }
  }

  NameList(list: any) {
    if (!list) {
      return "nil";
    } else if (list === this.updaters) {
      return "updaters";
    } else if (list === this.hibernaters) {
      return "hibernators";
    } else {
      for (const [k, v] of Object.entries(this.tickwaiters)) {
        if (list === v) {
          return `tickwaiter ${k}`;
        }
      }
    }

    return "Unknown";
  }

  SendToList(inst: any, list: any) {
    const old_list = this.instances[inst];
    if (old_list && old_list !== list) {
      if (old_list) {
        delete old_list[inst];
      }

      this.instances[inst] = list;

      if (list) {
        list[inst] = true;
      }
    }
  }

  Wake(inst: any) {
    if (this.instances[inst]) {
      this.SendToList(inst, this.updaters);
    }
  }

  Hibernate(inst: any) {
    if (this.instances[inst]) {
      this.SendToList(inst, this.hibernaters);
    }
  }

  Sleep(inst: any, time_to_wait: number) {
    let sleep_ticks = time_to_wait / GetTickTime();
    if (sleep_ticks === 0) sleep_ticks = 1;

    const target_tick = Math.floor(GetTick() + sleep_ticks);

    if (target_tick > GetTick()) {
      let waiters = this.tickwaiters[target_tick];

      if (!waiters) {
        waiters = {};
        this.tickwaiters[target_tick] = waiters;
      }

      this.SendToList(inst, waiters);
    }
  }

  RemoveInstance(inst: any) {
    this.SendToList(inst, null);
    delete this.updaters[inst];
    delete this.hibernaters[inst];
    for (const [k, v] of Object.entries(this.tickwaiters)) {
      delete v[inst];
    }
    delete this.instances[inst];
  }

  AddInstance(inst: any) {
    this.instances[inst] = this.updaters;
    this.updaters[inst] = true;
  }

  Update(current_tick: number) {
    const waiters = this.tickwaiters[current_tick];
    if (waiters) {
      for (const [k, v] of Object.entries(waiters)) {
        this.updaters[k] = true;
        this.instances[k] = this.updaters;
      }
      delete this.tickwaiters[current_tick];
    }

    for (const [k, v] of Object.entries(this.updaters)) {
      if (k.inst.entity.IsValid() && !k.inst.IsAsleep()) {
        k.OnUpdate();
        const sleep_amount = k.GetSleepTime();
        if (sleep_amount) {
          if (sleep_amount > GetTickTime()) {
            this.Sleep(k, sleep_amount);
          }
        } else {
          this.Hibernate(k);
        }
      }
    }
  }
}

const BrainManager = new BrainWrangler();

class Brain {
  inst: any = null;
  currentbehaviour: any = null;
  behaviourqueue: any[] = [];
  events: Record<string, any> = {};
  thinkperiod: any = null;
  lastthinktime: any = null;
  paused: boolean = false;

  ForceUpdate() {
    if (this.bt) {
      this.bt.ForceUpdate();
    }

    BrainManager.Wake(this);
  }

  toString() {
    if (this.bt) {
      return `--brain--\nsleep time: ${this.GetSleepTime()}\n${this.bt.toString()}`;
    }
    return "--brain--";
  }

  AddEventHandler(event: string, fn: any) {
    this.events[event] = fn;
  }

  GetSleepTime() {
    if (this.bt) {
      return this.bt.GetSleepTime();
    }

    return 0;
  }

  Start() {
    if (this.paused) {
      return;
    }

    if (this.OnStart) {
      this.OnStart();
    }
    this.stopped = false;
    BrainManager.AddInstance(this);
    if (this.OnInitializationComplete) {
      this.OnInitializationComplete();
    }

    if (this.modpostinitfns) {
      for (const modfn of this.modpostinitfns) {
        modfn(this);
      }
    }
  }

  OnUpdate() {
    if (this.DoUpdate) {
      this.DoUpdate();
    }

    if (this.bt) {
      this.bt.Update();
    }
  }

  Stop() {
    if (this.paused) {
      return;
    }

    if (this.OnStop) {
      this.OnStop();
    }
    if (this.bt) {
      this.bt.Stop();
    }
    this.stopped = true;
    BrainManager.RemoveInstance(this);
  }

  PushEvent(event: string, data: any) {
    const handler = this.events[event];

    if (handler) {
      handler(data);
    }
  }

  Pause() {
    this.paused = true;
    BrainManager.RemoveInstance(this);
  }

  Resume() {
    this.paused = false;
    BrainManager.AddInstance(this);
  }
}
