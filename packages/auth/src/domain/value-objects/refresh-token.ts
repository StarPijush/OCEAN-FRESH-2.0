import { ValueObject } from '@oceanfresh/shared/domain';
import { randomUUID } from 'crypto';

export class RefreshToken extends ValueObject {
  private constructor(private readonly _value: string) {
    super();
    if (!_value || _value.length === 0) {
      throw new Error('Refresh token cannot be empty');
    }
  }

  static generate(): RefreshToken {
    return new RefreshToken(randomUUID());
  }

  static create(value: string): RefreshToken {
    return new RefreshToken(value);
  }

  get value(): string {
    return this._value;
  }

  protected getEqualityComponents(): unknown[] {
    return [this._value];
  }
}
