enum BehaviorStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  READY = "READY",
  RUNNING = "RUNNING",
}

class BehaviorNode {
  static NODE_COUNT = 0;
  name: string;
  children: BehaviorNode[];
  status: BehaviorStatus;
  lastResult: BehaviorStatus;
  nextUpdateTime: number;
  parent: BehaviorNode | null;
  id: number;

  constructor(name = "", children: BehaviorNode[] = []) {
    this.name = name;
    this.children = children;
    this.status = BehaviorStatus.READY;
    this.lastResult = BehaviorStatus.READY;
    this.nextUpdateTime = 0;
    this.parent = null;
    this.id = BehaviorNode.NODE_COUNT;
    BehaviorNode.NODE_COUNT += 1;

    for (const child of children) {
      child.parent = this;
    }
  }

  doToParents(fn: (node: BehaviorNode) => void): void {
    if (this.parent) {
      fn(this.parent);
      this.parent.doToParents(fn);
    }
  }

  getTreeString(indent = ""): string {
    let str = `${indent}${this.getString()}>${
      this.getTreeSleepTime()?.toFixed(2) ?? "0.00"
    }\n`;
    if (this.children) {
      for (const child of this.children) {
        // uncomment this to see only the "active" part of the tree. handy for pigbrain.
        //if (child.status === BehaviorStatus.RUNNING || child.status === BehaviorStatus.SUCCESS || child.lastResult === BehaviorStatus.RUNNING || child.lastResult === BehaviorStatus.SUCCESS) {
        str += child.getTreeString(`${indent}   >`);
        //}
      }
    }
    return str;
  }

  dbString(): string {
    return "";
  }

  sleep(t: number): void {
    this.nextUpdateTime = Date.now() + t;
  }

  getSleepTime(): number | null {
    if (
      this.status === BehaviorStatus.RUNNING &&
      !this.children &&
      !(this instanceof ConditionNode)
    ) {
      if (this.nextUpdateTime) {
        let timeTo = this.nextUpdateTime - Date.now();
        if (timeTo < 0) {
          timeTo = 0;
        }
        return timeTo;
      }
      return 0;
    }
    return null;
  }

  getTreeSleepTime(): number | null {
    let sleepTime = null;
    if (this.children) {
      for (const child of this.children) {
        if (child.status === BehaviorStatus.RUNNING) {
          const t = child.getTreeSleepTime();
          if (t !== null && (sleepTime === null || sleepTime > t)) {
            sleepTime = t;
          }
        }
      }
    }

    const mySleepTime = this.getSleepTime();
    if (
      mySleepTime !== null &&
      (sleepTime === null || sleepTime > mySleepTime)
    ) {
      sleepTime = mySleepTime;
    }

    return sleepTime;
  }

  getString(): string {
    let str = "";
    if (this.status === BehaviorStatus.RUNNING) {
      str = this.dbString();
    }
    return `${this.name} - ${this.status ?? "UNKNOWN"} <${
      this.lastResult ?? "?"
    }> (${str})`;
  }

  visit(): void {
    this.status = BehaviorStatus.FAILED;
  }

  saveStatus(): void {
    this.lastResult = this.status;
    if (this.children) {
      for (const child of this.children) {
        child.saveStatus();
      }
    }
  }

  step(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.reset();
    } else if (this.children) {
      for (const child of this.children) {
        child.step();
      }
    }
  }

  reset(): void {
    if (this.status !== BehaviorStatus.READY) {
      this.status = BehaviorStatus.READY;
      if (this.children) {
        for (const child of this.children) {
          child.reset();
        }
      }
    }
  }

  stop(): void {
    if (this.children) {
      for (const child of this.children) {
        child.stop();
      }
    }
  }
}

class BT {
  inst: any;
  root: BehaviorNode;
  forceupdate: boolean = false;

  constructor(inst: any, root: BehaviorNode) {
    this.inst = inst;
    this.root = root;
  }

  forceUpdate(): void {
    this.forceupdate = true;
  }

  update(): void {
    this.root.visit();
    this.root.saveStatus();
    this.root.step();
    this.forceupdate = false;
  }

  reset(): void {
    this.root.reset();
  }

  stop(): void {
    this.root.stop();
  }

  getSleepTime(): number | null {
    if (this.forceupdate) {
      return 0;
    }
    return this.root.getTreeSleepTime();
  }

  toString(): string {
    return this.root.getTreeString();
  }
}
