import { ValueObject } from '../base/value-object.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email extends ValueObject {
  private constructor(private readonly _value: string) {
    super();
    const normalized = _value.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new Error(`Invalid email format: ${_value}`);
    }
  }

  static create(value: string): Email {
    return new Email(value);
  }

  get value(): string {
    return this._value;
  }

  get localPart(): string {
    return this._value.split('@')[0] as string;
  }

  get domain(): string {
    return this._value.split('@')[1] as string;
  }

  toJSON(): string {
    return this._value;
  }

  protected getEqualityComponents(): unknown[] {
    return [this._value];
  }
}
