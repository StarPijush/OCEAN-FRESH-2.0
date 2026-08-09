import { ValueObject } from '../base/value-object.js';

export enum CurrencyCode {
  INR = 'INR',
  USD = 'USD',
}

export class Money extends ValueObject {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: CurrencyCode,
  ) {
    super();
    if (_amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!Object.values(CurrencyCode).includes(_currency)) {
      throw new Error(`Unsupported currency: ${_currency}`);
    }
  }

  static of(amount: number, currency: CurrencyCode = CurrencyCode.INR): Money {
    return new Money(amount, currency);
  }

  static zero(currency: CurrencyCode = CurrencyCode.INR): Money {
    return new Money(0, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): CurrencyCode {
    return this._currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    return new Money(Math.round(this._amount * factor * 100) / 100, this._currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor must be positive');
    }
    return new Money(Math.round((this._amount / divisor) * 100) / 100, this._currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount > other._amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount < other._amount;
  }

  isEqualTo(other: Money): boolean {
    return this._currency === other._currency && this._amount === other._amount;
  }

  format(locale = 'en-IN'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(this._amount);
  }

  toJSON(): { amount: number; currency: CurrencyCode } {
    return { amount: this._amount, currency: this._currency };
  }

  protected getEqualityComponents(): unknown[] {
    return [this._amount, this._currency];
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }
}
