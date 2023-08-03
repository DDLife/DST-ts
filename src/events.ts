/**
 * This package provides classes and functions for managing events. It adapts the Factory Pattern.
 * The Factory Pattern is a creational pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.
 * @packageDocumentation
 */
/**
 * @internal
 * Represents an event handler that can be added or removed from an EventProcessor.
 * It is equivalent to product in factory pattern
 */
class EventHandler {
  /**
   * The name of the event that this handler is associated with.
   */
  event: string;
  /**
   * The function that will be called when the associated event is triggered.
   */
  fn: Function;
  /**
   * The EventProcessor that this handler is associated with.
   */
  processor: EventProcessor;

  /**
   * Creates a new EventHandler instance.
   * @param event The name of the event that this handler is associated with.
   * @param fn The function that will be called when the associated event is triggered.
   * @param processor The EventProcessor that this handler is associated with.
   */
  constructor(event: string, fn: Function, processor: EventProcessor) {
    this.event = event;
    this.fn = fn;
    this.processor = processor;
  }

  /**
   * Removes this handler from the associated EventProcessor.
   */
  Remove(): void {
    this.processor.RemoveHandler(this);
  }
}

/**
 * Represents an event processor that can manage event handlers and trigger events.
 * It is equivalent to factory in factory pattern
 */
export class EventProcessor {
  /**
   * A dictionary of events and their associated handlers.
   */
  events: { [key: string]: EventHandler[] };

  /**
   * Creates a new EventProcessor instance.
   */
  constructor() {
    this.events = {};
  }

  /**
   * Adds a new event handler to the processor.
   * @param event The name of the event to add the handler to.
   * @param fn The function to be called when the event is triggered.
   * @returns The EventHandler instance that was added.
   */
  AddEventHandler(event: string, fn: Function): EventHandler {
    const handler = new EventHandler(event, fn, this);

    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(handler);

    return handler;
  }

  /**
   * Removes an event handler from the processor.
   * @param handler The EventHandler instance to remove.
   */
  RemoveHandler(handler: EventHandler): void {
    if (handler) {
      const ev = this.events[handler.event];
      if (ev) {
        const index = ev.indexOf(handler);
        if (index >= 0) {
          ev.splice(index, 1);
        }
      }
    }
  }

  /**
   * Gets all the handlers for a given event.
   * @param event The name of the event to get the handlers for.
   * @returns A dictionary of all the handlers for the given event.
   */
  GetHandlersForEvent(event: string): EventHandler[] {
    return this.events[event] || [];
  }

  /**
   * Triggers an event and calls all the associated event handlers.
   * @param event The name of the event to trigger.
   * @param args The arguments to pass to the event handlers.
   */
  HandleEvent(event: string, ...args: any[]): void {
    const handlers = this.events[event];
    if (handlers) {
      for (const handler of handlers) {
        handler.fn(...args);
      }
    }
  }
}
