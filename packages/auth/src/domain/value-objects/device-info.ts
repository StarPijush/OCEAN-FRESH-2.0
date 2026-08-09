import { ValueObject } from '@oceanfresh/shared/domain';

export interface DeviceInfoData {
  userAgent: string;
  ipAddress: string;
  deviceType: string;
}

export class DeviceInfo extends ValueObject {
  private constructor(private readonly _data: DeviceInfoData) {
    super();
    if (!_data.userAgent) throw new Error('User agent is required');
    if (!_data.ipAddress) throw new Error('IP address is required');
    if (!_data.deviceType) throw new Error('Device type is required');
  }

  static create(data: DeviceInfoData): DeviceInfo {
    return new DeviceInfo(data);
  }

  get userAgent(): string {
    return this._data.userAgent;
  }

  get ipAddress(): string {
    return this._data.ipAddress;
  }

  get deviceType(): string {
    return this._data.deviceType;
  }

  toJSON(): DeviceInfoData {
    return { ...this._data };
  }

  protected getEqualityComponents(): unknown[] {
    return [this._data.userAgent, this._data.ipAddress, this._data.deviceType];
  }
}
