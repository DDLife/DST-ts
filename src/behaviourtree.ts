/**
 * This file contains the implementation of several classes and functions used to create and manipulate behavior trees.
 * A behavior tree is a tree-like structure used to model the behavior of an agent in a game or simulation.
 * The tree is made up of nodes, each of which represents a specific behavior or action that the agent can perform.
 * The nodes are connected by edges, which represent the order in which the behaviors should be executed.
 * The root node of the tree represents the overall behavior of the agent, and its children represent the sub-behaviors that make up that behavior.
 * The behavior tree is executed by traversing the tree from the root node to the leaf nodes, following the edges in the order specified by the tree.
 * The implementation includes several types of nodes, such as condition nodes, sequence nodes, priority nodes, parallel nodes, event nodes, and latch nodes.
 * These nodes can be combined in various ways to create complex behaviors for the agent.
 *
 */

// TODO: find the real defination
function GetTime(): number {
  return Date.now() / 1000;
}

enum BehaviorStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  READY = "READY",
  RUNNING = "RUNNING",
}

/**
 * The BehaviorNode class represents a node in a behavior tree.
 * Each node can have children nodes and a parent node.
 * It also has a status that represents the current state of the node.
 * The status can be SUCCESS, FAILED, READY, or RUNNING.
 * The BehaviorNode class has several methods that are used to traverse and manipulate the tree.
 */
class BehaviorNode {
  /**
   * The number of nodes created so far.
   */
  static NODE_COUNT = 0;

  /**
   * The name of the node.
   */
  name: string;

  /**
   * The children nodes of the node.
   */
  children: BehaviorNode[];

  /**
   * The status of the node.
   */
  status: BehaviorStatus;

  /**
   * The last result of the node.
   */
  lastResult: BehaviorStatus;

  /**
   * The next update time of the node.
   */
  nextUpdateTime: number;

  /**
   * The parent node of the node.
   */
  parent: BehaviorNode | null;

  /**
   * The id of the node.
   */
  id: number;

  /**
   * Creates a new instance of the BehaviorNode class.
   * @param name The name of the node.
   * @param children The children nodes of the node.
   */
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

  /**
   * Applies a function to all parent nodes of the node.
   * @param fn The function to apply to the parent nodes.
   */
  DoToParents(fn: (node: BehaviorNode) => void): void {
    if (this.parent) {
      fn(this.parent);
      this.parent.DoToParents(fn);
    }
  }

  /**
   * Returns a string representation of the tree starting from the node.
   * @param indent The indentation string to use.
   * @returns A string representation of the tree starting from the node.
   */
  GetTreeString(indent = ""): string {
    let str = `${indent}${this.GetString()}>${
      this.GetTreeSleepTime()?.toFixed(2) ?? "0.00"
    }\n`;
    if (this.children) {
      for (const child of this.children) {
        str += child.GetTreeString(`${indent}   >`);
      }
    }
    return str;
  }

  /**
   * Returns a string representation of the node for debugging purposes.
   * @returns A string representation of the node for debugging purposes.
   */
  DBString(): string {
    return "";
  }

  /**
   * Sets the next update time of the node.
   * @param t The time to set.
   */
  Sleep(t: number): void {
    this.nextUpdateTime = GetTime() + t;
  }

  /**
   * Returns the sleep time of the node.
   * @returns The sleep time of the node.
   */
  GetSleepTime(): number | null {
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

  /**
   * Returns the sleep time of the tree starting from the node.
   * @returns The sleep time of the tree starting from the node.
   */
  GetTreeSleepTime(): number | null {
    let sleepTime = null;
    if (this.children) {
      for (const child of this.children) {
        if (child.status === BehaviorStatus.RUNNING) {
          const t = child.GetTreeSleepTime();
          if (t !== null && (sleepTime === null || sleepTime > t)) {
            sleepTime = t;
          }
        }
      }
    }

    const mySleepTime = this.GetSleepTime();
    if (
      mySleepTime !== null &&
      (sleepTime === null || sleepTime > mySleepTime)
    ) {
      sleepTime = mySleepTime;
    }

    return sleepTime;
  }

  /**
   * Returns a string representation of the node.
   * @returns A string representation of the node.
   */
  GetString(): string {
    let str = "";
    if (this.status === BehaviorStatus.RUNNING) {
      str = this.DBString();
    }
    return `${this.name} - ${this.status ?? "UNKNOWN"} <${
      this.lastResult ?? "?"
    }> (${str})`;
  }

  /**
   * Visits the node.
   * @virtual
   */
  Visit(): void {
    this.status = BehaviorStatus.FAILED;
  }

  /**
   * Saves the status of the node.
   */
  SaveStatus(): void {
    this.lastResult = this.status;
    if (this.children) {
      for (const child of this.children) {
        child.SaveStatus();
      }
    }
  }

  /**
   * Steps the node.
   * @virtual
   */
  Step(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.Reset();
    } else if (this.children) {
      for (const child of this.children) {
        child.Step();
      }
    }
  }

  /**
   * Resets the node.
   * @virtual
   */
  Reset(): void {
    if (this.status !== BehaviorStatus.READY) {
      this.status = BehaviorStatus.READY;
      if (this.children) {
        for (const child of this.children) {
          child.Reset();
        }
      }
    }
  }

  /**
   * Stops the node.
   */
  Stop(): void {
    if (this.children) {
      for (const child of this.children) {
        child.Stop();
      }
    }
  }
}

/**
 * The BT class represents a behavior tree instance.
 */
class BT {
  /**
   * The instance associated with the behavior tree.
   */
  inst: any;

  /**
   * The root node of the behavior tree.
   */
  root: BehaviorNode;

  /**
   * A flag indicating whether the behavior tree should be force updated.
   */
  forceupdate: boolean = false;

  /**
   * Creates a new instance of the BT class.
   * @param inst The instance associated with the behavior tree.
   * @param root The root node of the behavior tree.
   */
  constructor(inst: any, root: BehaviorNode) {
    this.inst = inst;
    this.root = root;
  }

  /**
   * Forces an update of the behavior tree.
   */
  ForceUpdate(): void {
    this.forceupdate = true;
  }

  /**
   * Updates the behavior tree.
   */
  Update(): void {
    this.root.Visit();
    this.root.SaveStatus();
    this.root.Step();
    this.forceupdate = false;
  }

  /**
   * Resets the behavior tree.
   */
  Reset(): void {
    this.root.Reset();
  }

  /**
   * Stops the behavior tree.
   */
  Stop(): void {
    this.root.Stop();
  }

  /**
   * Gets the sleep time of the behavior tree.
   * @returns The sleep time of the behavior tree, or null if the behavior tree is not sleeping.
   */
  GetSleepTime(): number | null {
    if (this.forceupdate) {
      return 0;
    }
    return this.root.GetTreeSleepTime();
  }

  /**
   * Returns a string representation of the behavior tree.
   * @returns A string representation of the behavior tree.
   */
  toString(): string {
    return this.root.GetTreeString();
  }
}

class DecoratorNode extends BehaviorNode {
  constructor(name: string | null, child: BehaviorNode) {
    super(name ?? "Decorator", [child]);
  }
}

class ConditionNode extends BehaviorNode {
  fn: () => boolean;

  constructor(fn: () => boolean, name: string | null) {
    super(name ?? "Condition");
    this.fn = fn;
  }

  Visit(): void {
    if (this.fn()) {
      this.status = BehaviorStatus.SUCCESS;
    } else {
      this.status = BehaviorStatus.FAILED;
    }
  }
}

class MultiConditionNode extends BehaviorNode {
  start: () => boolean;
  continue: () => boolean;
  running: boolean;

  constructor(
    start: () => boolean,
    continueFn: () => boolean,
    name: string | null
  ) {
    super(name ?? "Condition");
    this.start = start;
    this.continue = continueFn;
    this.running = false;
  }

  Visit(): void {
    if (!this.running) {
      this.running = this.start();
    } else {
      this.running = this.continue();
    }

    if (this.running) {
      this.status = BehaviorStatus.SUCCESS;
    } else {
      this.status = BehaviorStatus.FAILED;
    }
  }
}

class ConditionWaitNode extends BehaviorNode {
  fn: () => boolean;

  constructor(fn: () => boolean, name: string | null) {
    super(name ?? "Wait");
    this.fn = fn;
  }

  Visit(): void {
    if (this.fn()) {
      this.status = BehaviorStatus.SUCCESS;
    } else {
      this.status = BehaviorStatus.RUNNING;
    }
  }
}

class ActionNode extends BehaviorNode {
  action: () => void;

  constructor(action: () => void, name: string | null) {
    super(name ?? "ActionNode");
    this.action = action;
  }

  Visit(): void {
    this.action();
    this.status = BehaviorStatus.SUCCESS;
  }
}

class WaitNode extends BehaviorNode {
  waitTime: number;
  wakeTime: number;

  constructor(time: number) {
    super("Wait");
    this.waitTime = time;
    this.wakeTime = 0;
  }

  DBString(): string {
    const w = this.wakeTime - Date.now();
    return w.toFixed(2);
  }

  Visit(): void {
    const currentTime = Date.now();

    if (this.status !== BehaviorStatus.RUNNING) {
      this.wakeTime = currentTime + this.waitTime;
      this.status = BehaviorStatus.RUNNING;
    }

    if (this.status === BehaviorStatus.RUNNING) {
      if (currentTime >= this.wakeTime) {
        this.status = BehaviorStatus.SUCCESS;
      } else {
        this.Sleep(currentTime - this.wakeTime);
      }
    }
  }
}

class SequenceNode extends BehaviorNode {
  idx: number;

  constructor(children: BehaviorNode[]) {
    super("Sequence", children);
    this.idx = 1;
  }

  DBString(): string {
    return this.idx.toString();
  }

  Reset(): void {
    super.Reset();
    this.idx = 1;
  }

  Visit(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.idx = 1;
    }

    let done = false;
    while (this.idx <= this.children.length) {
      const child = this.children[this.idx - 1];
      child.Visit();
      if (
        child.status === BehaviorStatus.RUNNING ||
        child.status === BehaviorStatus.FAILED
      ) {
        this.status = child.status;
        return;
      }

      this.idx += 1;
    }

    this.status = BehaviorStatus.SUCCESS;
  }
}

class SelectorNode extends BehaviorNode {
  idx: number;

  constructor(children: BehaviorNode[]) {
    super("Selector", children);
    this.idx = 1;
  }

  DBString(): string {
    return this.idx.toString();
  }

  Reset(): void {
    super.Reset();
    this.idx = 1;
  }

  Visit(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.idx = 1;
    }

    let done = false;
    while (this.idx <= this.children.length) {
      const child = this.children[this.idx - 1];
      child.Visit();
      if (
        child.status === BehaviorStatus.RUNNING ||
        child.status === BehaviorStatus.SUCCESS
      ) {
        this.status = child.status;
        return;
      }

      this.idx += 1;
    }

    this.status = BehaviorStatus.FAILED;
  }
}

class NotDecorator extends DecoratorNode {
  constructor(child: BehaviorNode) {
    super("Not", child);
  }

  Visit(): void {
    const child = this.children[0];
    child.Visit();
    if (child.status === BehaviorStatus.SUCCESS) {
      this.status = BehaviorStatus.FAILED;
    } else if (child.status === BehaviorStatus.FAILED) {
      this.status = BehaviorStatus.SUCCESS;
    } else {
      this.status = child.status;
    }
  }
}

class FailIfRunningDecorator extends DecoratorNode {
  constructor(child: BehaviorNode) {
    super("FailIfRunning", child);
  }

  Visit(): void {
    const child = this.children[0];
    child.Visit();
    if (child.status === BehaviorStatus.RUNNING) {
      this.status = BehaviorStatus.FAILED;
    } else {
      this.status = child.status;
    }
  }
}

class FailIfSuccessDecorator extends DecoratorNode {
  constructor(child: BehaviorNode) {
    super("FailIfSuccess", child);
  }

  Visit(): void {
    const child = this.children[0];
    child.Visit();
    if (child.status === BehaviorStatus.SUCCESS) {
      this.status = BehaviorStatus.FAILED;
    } else {
      this.status = child.status;
    }
  }
}

class LoopNode extends BehaviorNode {
  idx: number;
  maxreps: number | null;
  rep: number;

  constructor(children: BehaviorNode[], maxreps: number | null) {
    super("Sequence", children);
    this.idx = 1;
    this.maxreps = maxreps;
    this.rep = 0;
  }

  DBString(): string {
    return this.idx.toString();
  }

  Reset(): void {
    super.Reset();
    this.idx = 1;
    this.rep = 0;
  }

  Visit(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.idx = 1;
      this.rep = 0;
    }

    let done = false;
    while (this.idx <= this.children.length) {
      const child = this.children[this.idx - 1];
      child.Visit();
      if (
        child.status === BehaviorStatus.RUNNING ||
        child.status === BehaviorStatus.FAILED
      ) {
        if (child.status === BehaviorStatus.FAILED) {
          // console.log("EXIT LOOP ON FAIL");
        }
        this.status = child.status;
        return;
      }

      this.idx += 1;
    }

    this.idx = 1;

    this.rep += 1;
    if (this.maxreps !== null && this.rep >= this.maxreps) {
      // console.log("DONE LOOP");
      this.status = BehaviorStatus.SUCCESS;
    } else {
      for (const child of this.children) {
        child.Reset();
      }
    }
  }
}

class RandomNode extends BehaviorNode {
  idx: number | null;

  constructor(children: BehaviorNode[]) {
    super("Random", children);
    this.idx = null;
  }

  Reset(): void {
    super.Reset();
    this.idx = null;
  }

  Visit(): void {
    let done = false;

    if (this.status === BehaviorStatus.READY) {
      // pick a new child
      this.idx = Math.floor(Math.random() * this.children.length);
      const start = this.idx;
      while (true) {
        const child = this.children[this.idx];
        child.Visit();

        if (child.status !== BehaviorStatus.FAILED) {
          this.status = child.status;
          return;
        }

        this.idx += 1;
        if (this.idx >= this.children.length) {
          this.idx = 0;
        }

        if (this.idx === start) {
          this.status = BehaviorStatus.FAILED;
          return;
        }
      }
    } else {
      const child = this.children[this.idx!];
      child.Visit();
      this.status = child.status;
    }
  }
}

class PriorityNode extends BehaviorNode {
  period: number | null;
  lasttime: number | null = null;
  idx: number | null = null;

  constructor(
    children: BehaviorNode[],
    period: number | null,
    noscatter?: boolean
  ) {
    super("Priority", children);
    this.period = period || 1;
    if (!noscatter) {
      this.lasttime = this.period * 0.5 + this.period * Math.random();
    }
  }

  GetSleepTime(): number | null {
    if (this.status === BehaviorStatus.RUNNING) {
      if (!this.period) {
        return 0;
      }

      let timeTo = 0;
      if (this.lasttime !== null) {
        timeTo = this.lasttime + this.period - GetTime();
        if (timeTo < 0) {
          timeTo = 0;
        }
      }

      return timeTo;
    } else if (this.status === BehaviorStatus.READY) {
      return 0;
    }

    return null;
  }

  DBString(): string {
    let timeTill = 0;
    if (this.period) {
      timeTill = (this.lasttime || 0) + this.period - GetTime();
    }

    return `execute ${
      this.idx !== null ? this.idx : -1
    }, eval in ${timeTill.toFixed(2)}`;
  }

  Reset(): void {
    super.Reset();
    this.idx = null;
  }

  Visit(): void {
    const time = GetTime();
    const doEval =
      this.lasttime === null ||
      this.period === null ||
      this.lasttime + this.period < time;
    const oldIdx = this.idx;

    if (doEval) {
      let oldEvent: EventNode | null = null;
      if (this.idx !== null && this.children[this.idx] instanceof EventNode) {
        oldEvent = this.children[this.idx] as EventNode;
      }

      this.lasttime = time;
      let found = false;
      for (let idx = 0; idx < this.children.length; idx++) {
        const child = this.children[idx];

        const shouldTestAnyway =
          oldEvent !== null &&
          child instanceof EventNode &&
          oldEvent.priority <= (child as EventNode).priority;
        if (!found || shouldTestAnyway) {
          if (
            child.status === BehaviorStatus.FAILED ||
            child.status === BehaviorStatus.SUCCESS
          ) {
            child.Reset();
          }
          child.Visit();
          const cs = child.status;
          if (cs === BehaviorStatus.SUCCESS || cs === BehaviorStatus.RUNNING) {
            if (shouldTestAnyway && this.idx !== idx) {
              this.children[this.idx!].Reset();
            }
            this.status = cs;
            found = true;
            this.idx = idx;
          }
        } else {
          child.Reset();
        }
      }
      if (!found) {
        this.status = BehaviorStatus.FAILED;
      }
    } else {
      if (this.idx !== null) {
        const child = this.children[this.idx];
        if (child.status === BehaviorStatus.RUNNING) {
          child.Visit();
          this.status = child.status;
          if (this.status !== BehaviorStatus.RUNNING) {
            this.lasttime = null;
          }
        }
      }
    }
  }
}

class ParallelNode extends BehaviorNode {
  stopOnAnyComplete: boolean;

  constructor(children: BehaviorNode[], name?: string) {
    super(name || "Parallel", children);
    this.stopOnAnyComplete = false;
  }

  Step(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.Reset();
    } else if (this.children) {
      for (const child of this.children) {
        if (
          child.status === BehaviorStatus.SUCCESS &&
          child instanceof ConditionNode
        ) {
          child.Reset();
        }
      }
    }
  }

  Visit(): void {
    let done = true;
    let anyDone = false;
    for (const [idx, child] of this.children.entries()) {
      if (child instanceof ConditionNode) {
        child.Reset();
      }

      if (child.status !== BehaviorStatus.SUCCESS) {
        child.Visit();
        if (child.status === BehaviorStatus.FAILED) {
          this.status = BehaviorStatus.FAILED;
          return;
        }
      }

      if (child.status === BehaviorStatus.RUNNING) {
        done = false;
      } else {
        anyDone = true;
      }
    }

    if (done || (this.stopOnAnyComplete && anyDone)) {
      this.status = BehaviorStatus.SUCCESS;
    } else {
      this.status = BehaviorStatus.RUNNING;
    }
  }
}

class ParallelNodeAny extends ParallelNode {
  constructor(children: BehaviorNode[]) {
    super(children, "Parallel(Any)");
    this.stopOnAnyComplete = true;
  }
}

class EventNode extends BehaviorNode {
  inst: any;
  event: string;
  priority: number;
  eventfn: any;
  triggered: boolean;
  data: any;

  constructor(
    inst: any,
    event: string,
    child: BehaviorNode,
    priority?: number
  ) {
    super(`Event(${event})`, [child]);
    this.inst = inst;
    this.event = event;
    this.priority = priority || 0;
    this.eventfn = (inst: any, data: any) => this.onEvent(data);
    this.inst.ListenForEvent(this.event, this.eventfn);
    this.triggered = false;
    this.data = null;
  }

  onStop(): void {
    if (this.eventfn) {
      this.inst.RemoveEventCallback(this.event, this.eventfn);
      this.eventfn = null;
    }
  }

  onEvent(data: any): void {
    if (this.status === BehaviorStatus.RUNNING) {
      this.children[0].Reset();
    }
    this.triggered = true;
    this.data = data;
    if (this.inst.brain) {
      this.inst.brain.forceUpdate();
    }
    this.DoToParents((node: BehaviorNode) => {
      if (node instanceof PriorityNode) {
        node.lasttime = null;
      }
    });
  }

  Step(): void {
    super.Step();
    this.triggered = false;
  }

  Reset(): void {
    super.Reset();
    this.triggered = false;
  }

  Visit(): void {
    if (this.status === BehaviorStatus.READY && this.triggered) {
      this.status = BehaviorStatus.RUNNING;
    }

    if (this.status === BehaviorStatus.RUNNING) {
      if (this.children && this.children.length === 1) {
        const child = this.children[0];
        child.Visit();
        this.status = child.status;
      } else {
        this.status = BehaviorStatus.FAILED;
      }
    }
  }
}

function whileNode(
  cond: () => boolean,
  name: string,
  node: BehaviorNode
): BehaviorNode {
  return new ParallelNode([new ConditionNode(cond, name), node]);
}

function ifNode(
  cond: () => boolean,
  name: string,
  node: BehaviorNode
): BehaviorNode {
  return new SequenceNode([new ConditionNode(cond, name), node]);
}

function ifThenDoWhileNode(
  ifcond: () => boolean,
  whilecond: () => boolean,
  name: string,
  node: BehaviorNode
): BehaviorNode {
  return new ParallelNode([
    new MultiConditionNode(ifcond, whilecond, name),
    node,
  ]);
}

class LatchNode extends BehaviorNode {
  inst: any;
  latchduration: number | (() => number);
  currentlatchduration: number;
  lastlatchtime: number;

  constructor(
    inst: any,
    latchduration: number | (() => number),
    child: BehaviorNode
  ) {
    super(`Latch (${latchduration})`, [child]);
    this.inst = inst;
    this.latchduration = latchduration;
    this.currentlatchduration = 0;
    this.lastlatchtime = -Infinity;
  }

  Visit(): void {
    if (this.status === BehaviorStatus.READY) {
      if (GetTime() > this.currentlatchduration + this.lastlatchtime) {
        console.log(
          "GONNA GO!",
          GetTime(),
          this.currentlatchduration,
          "----",
          GetTime() + this.currentlatchduration,
          ">",
          this.lastlatchtime
        );
        this.lastlatchtime = GetTime();
        this.currentlatchduration =
          typeof this.latchduration === "function"
            ? this.latchduration()
            : this.latchduration;
        console.log("New vals:", this.currentlatchduration, this.lastlatchtime);
        this.status = BehaviorStatus.RUNNING;
      } else {
        this.status = BehaviorStatus.FAILED;
      }
    }

    if (this.status === BehaviorStatus.RUNNING) {
      this.children[0].Visit();
      this.status = this.children[0].status;
    }
  }
}
