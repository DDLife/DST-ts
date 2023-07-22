export function FunctionOrValue<T>(
  funcOrVal: T | ((...args: any[]) => T),
  ...args: any[]
): T {
  if (typeof funcOrVal === "function") {
    return (funcOrVal as (...args: any[]) => T)(...args);
  }
  return funcOrVal;
}
