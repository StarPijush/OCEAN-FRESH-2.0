export interface EventBus<
  TEvent extends { type: string },
  TEventType extends string = TEvent['type'],
> {
  publish(event: TEvent): Promise<void>;
  subscribe(eventType: TEventType, handler: (event: TEvent) => void): () => void;
  clear(): void;
}
