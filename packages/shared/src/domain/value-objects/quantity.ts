import { ValueObject } from '../base/value-object.js';

export enum Unit {
  KILOGRAM = 'kg',
  GRAM = 'g',
  PIECE = 'pcs',
  DOZEN = 'dozen',
  LITRE = 'L',
  MILLILITRE = 'mL',
  PACK = 'pack',
}

export class Quantity extends ValueObject {
  private constructor(
    private readonly _value: number,
    private readonly _unit: Unit,
  ) {
    super();
    if (_value < 0) throw new Error('Quantity cannot be negative');
    if (Math.floor(_value) !== _value) throw new Error('Quantity must be a whole number');
  }

  static of(value: number, unit: Unit = Unit.PIECE): Quantity {
    return new Quantity(value, unit);
  }

  get value(): number {
    return this._value;
  }
  get unit(): Unit {
    return this._unit;
  }

  add(other: Quantity): Quantity {
    if (this._unit !== other._unit)
      throw new Error(`Unit mismatch: ${this._unit} vs ${other._unit}`);
    return new Quantity(this._value + other._value, this._unit);
  }

  subtract(other: Quantity): Quantity {
    if (this._unit !== other._unit)
      throw new Error(`Unit mismatch: ${this._unit} vs ${other._unit}`);
    const result = this._value - other._value;
    if (result < 0) throw new Error('Result cannot be negative');
    return new Quantity(result, this._unit);
  }

  isGreaterThan(other: Quantity): boolean {
    if (this._unit !== other._unit)
      throw new Error(`Unit mismatch: ${this._unit} vs ${other._unit}`);
    return this._value > other._value;
  }

  toJSON(): { value: number; unit: Unit } {
    return { value: this._value, unit: this._unit };
  }

  protected getEqualityComponents(): unknown[] {
    return [this._value, this._unit];
  }
}
