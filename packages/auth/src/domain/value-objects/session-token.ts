import { ValueObject } from '@oceanfresh/shared/domain';
import { randomUUID } from 'crypto';

export class SessionToken extends ValueObject {
  private constructor(private readonly _value: string) {
    super();
    if (!_value || _value.length === 0) {
      throw new Error('Session token cannot be empty');
    }
  }

  static generate(): SessionToken {
    return new SessionToken(randomUUID());
  }

  static create(value: string): SessionToken {
    return new SessionToken(value);
  }

  get value(): string {
    return this._value;
  }

  protected getEqualityComponents(): unknown[] {
    return [this._value];
  }
}
