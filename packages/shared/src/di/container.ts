type Factory<T> = () => T;

export class Container {
  private services = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();
  private singletons = new Set<string>();

  register<T>(token: string, factory: Factory<T>, singleton = true): void {
    this.factories.set(token, factory as Factory<unknown>);
    if (singleton) {
      this.singletons.add(token);
    }
  }

  resolve<T>(token: string): T {
    if (this.singletons.has(token) && this.services.has(token)) {
      return this.services.get(token) as T;
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`Service ${token} not registered in DI container`);
    }

    const instance = factory() as T;

    if (this.singletons.has(token)) {
      this.services.set(token, instance);
    }

    return instance;
  }

  has(token: string): boolean {
    return this.factories.has(token);
  }

  reset(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }
}

export const container = new Container();
