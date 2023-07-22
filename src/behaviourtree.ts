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
function getTime(): number {
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
  doToParents(fn: (node: BehaviorNode) => void): void {
    if (this.parent) {
      fn(this.parent);
      this.parent.doToParents(fn);
    }
  }

  /**
   * Returns a string representation of the tree starting from the node.
   * @param indent The indentation string to use.
   * @returns A string representation of the tree starting from the node.
   */
  getTreeString(indent = ""): string {
    let str = `${indent}${this.getString()}>${
      this.getTreeSleepTime()?.toFixed(2) ?? "0.00"
    }\n`;
    if (this.children) {
      for (const child of this.children) {
        str += child.getTreeString(`${indent}   >`);
      }
    }
    return str;
  }

  /**
   * Returns a string representation of the node for debugging purposes.
   * @returns A string representation of the node for debugging purposes.
   */
  dbString(): string {
    return "";
  }

  /**
   * Sets the next update time of the node.
   * @param t The time to set.
   */
  sleep(t: number): void {
    this.nextUpdateTime = Date.now() + t;
  }

  /**
   * Returns the sleep time of the node.
   * @returns The sleep time of the node.
   */
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

  /**
   * Returns the sleep time of the tree starting from the node.
   * @returns The sleep time of the tree starting from the node.
   */
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

  /**
   * Returns a string representation of the node.
   * @returns A string representation of the node.
   */
  getString(): string {
    let str = "";
    if (this.status === BehaviorStatus.RUNNING) {
      str = this.dbString();
    }
    return `${this.name} - ${this.status ?? "UNKNOWN"} <${
      this.lastResult ?? "?"
    }> (${str})`;
  }

  /**
   * Visits the node.
   * @virtual
   */
  visit(): void {
    this.status = BehaviorStatus.FAILED;
  }

  /**
   * Saves the status of the node.
   */
  saveStatus(): void {
    this.lastResult = this.status;
    if (this.children) {
      for (const child of this.children) {
        child.saveStatus();
      }
    }
  }

  /**
   * Steps the node.
   * @virtual
   */
  step(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.reset();
    } else if (this.children) {
      for (const child of this.children) {
        child.step();
      }
    }
  }

  /**
   * Resets the node.
   * @virtual
   */
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

  /**
   * Stops the node.
   */
  stop(): void {
    if (this.children) {
      for (const child of this.children) {
        child.stop();
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
  forceUpdate(): void {
    this.forceupdate = true;
  }

  /**
   * Updates the behavior tree.
   */
  update(): void {
    this.root.visit();
    this.root.saveStatus();
    this.root.step();
    this.forceupdate = false;
  }

  /**
   * Resets the behavior tree.
   */
  reset(): void {
    this.root.reset();
  }

  /**
   * Stops the behavior tree.
   */
  stop(): void {
    this.root.stop();
  }

  /**
   * Gets the sleep time of the behavior tree.
   * @returns The sleep time of the behavior tree, or null if the behavior tree is not sleeping.
   */
  getSleepTime(): number | null {
    if (this.forceupdate) {
      return 0;
    }
    return this.root.getTreeSleepTime();
  }

  /**
   * Returns a string representation of the behavior tree.
   * @returns A string representation of the behavior tree.
   */
  toString(): string {
    return this.root.getTreeString();
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

  visit(): void {
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

  visit(): void {
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

  visit(): void {
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

  visit(): void {
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

  dbString(): string {
    const w = this.wakeTime - Date.now();
    return w.toFixed(2);
  }

  visit(): void {
    const currentTime = Date.now();

    if (this.status !== BehaviorStatus.RUNNING) {
      this.wakeTime = currentTime + this.waitTime;
      this.status = BehaviorStatus.RUNNING;
    }

    if (this.status === BehaviorStatus.RUNNING) {
      if (currentTime >= this.wakeTime) {
        this.status = BehaviorStatus.SUCCESS;
      } else {
        this.sleep(currentTime - this.wakeTime);
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

  dbString(): string {
    return this.idx.toString();
  }

  reset(): void {
    super.reset();
    this.idx = 1;
  }

  visit(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.idx = 1;
    }

    let done = false;
    while (this.idx <= this.children.length) {
      const child = this.children[this.idx - 1];
      child.visit();
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

  dbString(): string {
    return this.idx.toString();
  }

  reset(): void {
    super.reset();
    this.idx = 1;
  }

  visit(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.idx = 1;
    }

    let done = false;
    while (this.idx <= this.children.length) {
      const child = this.children[this.idx - 1];
      child.visit();
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

  visit(): void {
    const child = this.children[0];
    child.visit();
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

  visit(): void {
    const child = this.children[0];
    child.visit();
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

  visit(): void {
    const child = this.children[0];
    child.visit();
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

  dbString(): string {
    return this.idx.toString();
  }

  reset(): void {
    super.reset();
    this.idx = 1;
    this.rep = 0;
  }

  visit(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.idx = 1;
      this.rep = 0;
    }

    let done = false;
    while (this.idx <= this.children.length) {
      const child = this.children[this.idx - 1];
      child.visit();
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
        child.reset();
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

  reset(): void {
    super.reset();
    this.idx = null;
  }

  visit(): void {
    let done = false;

    if (this.status === BehaviorStatus.READY) {
      // pick a new child
      this.idx = Math.floor(Math.random() * this.children.length);
      const start = this.idx;
      while (true) {
        const child = this.children[this.idx];
        child.visit();

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
      child.visit();
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

  getSleepTime(): number | null {
    if (this.status === BehaviorStatus.RUNNING) {
      if (!this.period) {
        return 0;
      }

      let timeTo = 0;
      if (this.lasttime !== null) {
        timeTo = this.lasttime + this.period - getTime();
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

  dbString(): string {
    let timeTill = 0;
    if (this.period) {
      timeTill = (this.lasttime || 0) + this.period - getTime();
    }

    return `execute ${
      this.idx !== null ? this.idx : -1
    }, eval in ${timeTill.toFixed(2)}`;
  }

  reset(): void {
    super.reset();
    this.idx = null;
  }

  visit(): void {
    const time = getTime();
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
            child.reset();
          }
          child.visit();
          const cs = child.status;
          if (cs === BehaviorStatus.SUCCESS || cs === BehaviorStatus.RUNNING) {
            if (shouldTestAnyway && this.idx !== idx) {
              this.children[this.idx!].reset();
            }
            this.status = cs;
            found = true;
            this.idx = idx;
          }
        } else {
          child.reset();
        }
      }
      if (!found) {
        this.status = BehaviorStatus.FAILED;
      }
    } else {
      if (this.idx !== null) {
        const child = this.children[this.idx];
        if (child.status === BehaviorStatus.RUNNING) {
          child.visit();
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

  step(): void {
    if (this.status !== BehaviorStatus.RUNNING) {
      this.reset();
    } else if (this.children) {
      for (const child of this.children) {
        if (
          child.status === BehaviorStatus.SUCCESS &&
          child instanceof ConditionNode
        ) {
          child.reset();
        }
      }
    }
  }

  visit(): void {
    let done = true;
    let anyDone = false;
    for (const [idx, child] of this.children.entries()) {
      if (child instanceof ConditionNode) {
        child.reset();
      }

      if (child.status !== BehaviorStatus.SUCCESS) {
        child.visit();
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
      this.children[0].reset();
    }
    this.triggered = true;
    this.data = data;
    if (this.inst.brain) {
      this.inst.brain.forceUpdate();
    }
    this.doToParents((node: BehaviorNode) => {
      if (node instanceof PriorityNode) {
        node.lasttime = null;
      }
    });
  }

  step(): void {
    super.step();
    this.triggered = false;
  }

  reset(): void {
    super.reset();
    this.triggered = false;
  }

  visit(): void {
    if (this.status === BehaviorStatus.READY && this.triggered) {
      this.status = BehaviorStatus.RUNNING;
    }

    if (this.status === BehaviorStatus.RUNNING) {
      if (this.children && this.children.length === 1) {
        const child = this.children[0];
        child.visit();
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

  visit(): void {
    if (this.status === BehaviorStatus.READY) {
      if (getTime() > this.currentlatchduration + this.lastlatchtime) {
        console.log(
          "GONNA GO!",
          getTime(),
          this.currentlatchduration,
          "----",
          getTime() + this.currentlatchduration,
          ">",
          this.lastlatchtime
        );
        this.lastlatchtime = getTime();
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
      this.children[0].visit();
      this.status = this.children[0].status;
    }
  }
}
