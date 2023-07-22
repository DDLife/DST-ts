import Widget from "widgets/widget";

export class Screen extends Widget {
  handlers: { [event: string]: { [fn: string]: boolean } };

  is_screen: boolean;

  last_focus: Widget | null;

  default_focus: Widget | null;

  constructor(name: string) {
    super(name);
    this.handlers = {};
    this.is_screen = true;
    this.last_focus = null;
    this.default_focus = null;
  }

  OnCreate(): void {}

  GetHelpText(): string {
    return "";
  }

  OnDestroy(): void {
    this.Kill();
  }

  OnUpdate(dt: number): boolean {
    return true;
  }

  OnBecomeInactive(): void {
    this.last_focus = this.GetDeepestFocus();
  }

  OnBecomeActive(): void {
    LastUIRoot = this.inst.entity;
    TheSim.SetUIRoot(this.inst.entity);
    if (this.last_focus && this.last_focus.inst.entity.IsValid()) {
      this.last_focus.SetFocus();
    } else {
      this.last_focus = null;
      if (this.default_focus) {
        this.default_focus.SetFocus();
      }
    }
  }

  AddEventHandler(
    event: string,
    fn: (...args: any[]) => void
  ): (...args: any[]) => void {
    if (!this.handlers[event]) {
      this.handlers[event] = {};
    }

    this.handlers[event][fn.toString()] = true;

    return fn;
  }

  RemoveEventHandler(event: string, fn: (...args: any[]) => void): void {
    if (this.handlers[event]) {
      delete this.handlers[event][fn.toString()];
    }
  }

  HandleEvent(type: string, ...args: any[]): void {
    const handlers = this.handlers[type];
    if (handlers) {
      for (const fn in handlers) {
        if (Object.prototype.hasOwnProperty.call(handlers, fn)) {
          eval(fn)(...args);
        }
      }
    }
  }

  SetDefaultFocus(): boolean {
    if (this.default_focus) {
      this.default_focus.SetFocus();
      return true;
    }
    return false;
  }
}
