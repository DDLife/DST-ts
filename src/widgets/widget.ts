import { FunctionOrValue } from "util";
//TODO
function CreateEntity() {}

export default class Widget {
  children: Widget[];
  callbacks: { [event: string]: ((...args: any[]) => void)[] };
  name: string;
  inst: Entity;
  enabled: boolean;
  shown: boolean;
  focus: boolean;
  focus_target: boolean;
  can_fade_alpha: boolean;
  focus_flow: any[];
  focus_flow_args: any[];
  parent_scroll_list?: any;
  parent?: any;
  editing?: any;
  constructor(name: string = "widget") {
    this.children = [];
    this.callbacks = {};
    this.name = name;

    this.inst = CreateEntity();
    //if your widget does something that is based on gameplay, use these over the default, so that pausing freezes the effect.
    this.inst.DoSimPeriodicTask = this.inst.DoPeriodicTask;
    this.inst.DoSimTaskInTime = this.inst.DoTaskInTime;
    this.inst.widget = this;
    this.inst.name = name;

    this.inst.AddTag("widget");
    this.inst.AddTag("UI");
    this.inst.entity.SetName(name);
    this.inst.entity.AddUITransform();
    this.inst.entity.CallPrefabConstructionComplete();

    this.inst.AddComponent("uianim");

    this.UpdateWhilePaused(true);

    this.enabled = true;
    this.shown = true;
    this.focus = false;
    this.focus_target = false;
    this.can_fade_alpha = true;

    this.focus_flow = [];
    this.focus_flow_args = [];
  }

  UpdateWhilePaused(enabled: boolean): void {
    if (enabled) {
      //widgets run all their tasks on StaticUpdate instead of Update so pausing the server doesn't pause widget tasks.
      this.inst.DoPeriodicTask = this.inst.DoStaticPeriodicTask;
      this.inst.DoTaskInTime = this.inst.DoStaticTaskInTime;
    } else {
      this.inst.DoPeriodicTask = this.inst.DoSimPeriodicTask;
      this.inst.DoTaskInTime = this.inst.DoSimTaskInTime;
    }
    this.inst.components.uianim.UpdateWhilePaused(enabled);
  }

  IsDeepestFocus(): boolean {
    if (this.focus) {
      for (const child of this.children) {
        if (child.focus) {
          return false;
        }
      }
    }
    return true;
  }

  OnMouseButton(button: number, down: boolean, x: number, y: number): boolean {
    if (!this.focus) {
      return false;
    }
    for (const child of this.children) {
      if (child.focus && child.OnMouseButton(button, down, x, y)) {
        return true;
      }
    }
    return false;
  }

  MoveToBack(): void {
    this.inst.entity.MoveToBack();
  }

  MoveToFront(): void {
    this.inst.entity.MoveToFront();
  }

  OnFocusMove(dir: string, down: boolean): boolean {
    if (!this.focus) return false;

    for (const child of this.children) {
      if (child.focus && child.OnFocusMove(dir, down)) return true;
    }

    if (down && this.focus_flow[dir as keyof typeof this.focus_flow]) {
      const dest = FunctionOrValue(
        this.focus_flow[dir as keyof typeof this.focus_flow],
        this
      );
      // Can we pass the focus down the chain if we are disabled/hidden?
      if (dest && dest.IsVisible() && dest.enabled) {
        if (this.focus_flow_args[dir as keyof typeof this.focus_flow_args]) {
          dest.SetFocus(
            ...this.focus_flow_args[dir as keyof typeof this.focus_flow_args]
          );
        } else {
          dest.SetFocus();
        }
        return true;
      }
    }

    if (this.parent_scroll_list) {
      return this.parent_scroll_list.OnFocusMove(dir, down);
    }

    return false;
  }

  IsVisible(): boolean {
    return this.shown && (this.parent == null || this.parent.IsVisible());
  }

  OnRawKey(key: string, down: boolean): boolean {
    if (!this.focus) return false;

    for (const child of this.children) {
      if (child.focus && child.OnRawKey(key, down)) return true;
    }

    return false;
  }

  OnTextInput(text: string): boolean {
    if (!this.focus) return false;

    for (const child of this.children) {
      if (child.focus && child.OnTextInput(text)) return true;
    }

    return false;
  }

  OnStopForceProcessTextInput(): void {
    // Do nothing
  }

  OnControl(control: number, down: boolean): boolean {
    if (!this.focus) return false;

    for (const child of this.children) {
      if (child.focus && child.OnControl(control, down)) return true;
    }

    if (
      this.parent_scroll_list &&
      (control === CONTROL_SCROLLBACK || control === CONTROL_SCROLLFWD)
    ) {
      return this.parent_scroll_list.OnControl(control, down);
    }

    return false;
  }

  SetParentScrollList(list: any): void {
    this.parent_scroll_list = list;
  }

  IsEditing() {
    // recursive check to see if anything has text edit focus
    if (this.editing) {
      return true;
    }

    for (const child of this.children) {
      if (child.IsEditing()) {
        return true;
      }
    }

    return false;
  }
}
