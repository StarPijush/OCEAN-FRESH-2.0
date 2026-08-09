import { ValueObject } from '../base/value-object.js';

export interface PhoneData {
  countryCode: string;
  nationalNumber: string;
}

export class Phone extends ValueObject {
  private static readonly INDIAN_MOBILE = /^[6-9]\d{9}$/;

  private constructor(private readonly _data: PhoneData) {
    super();
    if (!_data.countryCode) throw new Error('Country code is required');
    if (!_data.nationalNumber) throw new Error('National number is required');
  }

  static create(countryCode: string, nationalNumber: string): Phone {
    return new Phone({ countryCode, nationalNumber });
  }

  static indianMobile(number: string): Phone {
    const cleaned = number.replace(/\D/g, '');
    if (!Phone.INDIAN_MOBILE.test(cleaned)) {
      throw new Error(`Invalid Indian mobile number: ${number}`);
    }
    return new Phone({ countryCode: '+91', nationalNumber: cleaned });
  }

  get countryCode(): string {
    return this._data.countryCode;
  }
  get nationalNumber(): string {
    return this._data.nationalNumber;
  }

  get e164(): string {
    return `${this._data.countryCode}${this._data.nationalNumber}`;
  }

  toJSON(): PhoneData {
    return { ...this._data };
  }

  protected getEqualityComponents(): unknown[] {
    return [this._data.countryCode, this._data.nationalNumber];
  }
}
