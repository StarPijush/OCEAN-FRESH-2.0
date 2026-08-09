import type { DeviceInfoData } from '../value-objects/device-info.js';

export interface LoginCommand {
  email: string;
  password: string;
  deviceInfo: DeviceInfoData;
}
