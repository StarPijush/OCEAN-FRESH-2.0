import type { DomainEvent } from '@oceanfresh/shared/domain';

import type { DeviceInfo } from '../value-objects/device-info.js';

export class UserLoggedInEvent implements DomainEvent {
  public readonly eventName = 'auth.user.logged_in';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly timestamp: Date,
    public readonly deviceInfo: DeviceInfo,
  ) {
    this.occurredOn = timestamp;
  }
}
