export abstract class ValueObject {
  protected abstract getEqualityComponents(): unknown[];

  public equals(other: unknown): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    const otherVo = other as ValueObject;
    const thisComponents = this.getEqualityComponents();
    const otherComponents = otherVo.getEqualityComponents();
    if (thisComponents.length !== otherComponents.length) {
      return false;
    }
    return thisComponents.every((component, index) =>
      deepEquals(component, otherComponents[index]),
    );
  }

  public hashCode(): string {
    return `${this.constructor.name}:${JSON.stringify(this.getEqualityComponents())}`;
  }
}

function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEquals(v, b[i]));
  }
  if (a instanceof ValueObject && b instanceof ValueObject) {
    return a.equals(b);
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) =>
        deepEquals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
      )
    );
  }
  return a === b;
}
