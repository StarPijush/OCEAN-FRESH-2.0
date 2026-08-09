import { ValueObject } from '../base/value-object.js';

export interface AddressData {
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

export class Address extends ValueObject {
  private constructor(private readonly _data: AddressData) {
    super();
    if (!_data.street.trim()) throw new Error('Street is required');
    if (!_data.city.trim()) throw new Error('City is required');
    if (!_data.state.trim()) throw new Error('State is required');
    if (!/^\d{6}$/.test(_data.pincode)) {
      throw new Error('Pincode must be a 6-digit number');
    }
    if (!_data.country.trim()) throw new Error('Country is required');
  }

  static create(data: AddressData): Address {
    return new Address({ ...data });
  }

  static indian(
    street: string,
    area: string,
    city: string,
    state: string,
    pincode: string,
    landmark?: string,
  ): Address {
    return new Address({ street, area, city, state, pincode, country: 'India', landmark });
  }

  get street(): string {
    return this._data.street;
  }
  get area(): string {
    return this._data.area;
  }
  get city(): string {
    return this._data.city;
  }
  get state(): string {
    return this._data.state;
  }
  get pincode(): string {
    return this._data.pincode;
  }
  get country(): string {
    return this._data.country;
  }
  get landmark(): string | undefined {
    return this._data.landmark;
  }

  get fullAddress(): string {
    const parts = [
      this._data.street,
      this._data.area,
      this._data.city,
      this._data.state,
      this._data.pincode,
    ];
    if (this._data.landmark) parts.push(`near ${this._data.landmark}`);
    return parts.join(', ');
  }

  toJSON(): AddressData {
    return { ...this._data };
  }

  protected getEqualityComponents(): unknown[] {
    return [
      this._data.street,
      this._data.area,
      this._data.city,
      this._data.state,
      this._data.pincode,
      this._data.country,
      this._data.landmark,
    ];
  }
}
