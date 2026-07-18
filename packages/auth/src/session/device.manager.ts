import { createLogger, type DeviceInfo } from '@oceanfresh/shared';

const logger = createLogger('auth:session:device');

export class DeviceManager {
  async fingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ];
    const input = components.join('|||');
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    return {
      id: '',
      name: this.getDeviceName(ua),
      type: this.getDeviceType(ua),
      os: this.getOS(ua),
      browser: this.getBrowser(ua),
      ipHash: '',
      isTrusted: false,
      riskScore: 0,
      lastLoginAt: Date.now(),
    };
  }

  async calculateRiskScore(device: DeviceInfo, knownDevices: DeviceInfo[]): Promise<number> {
    let score = 0;

    const knownIds = new Set(knownDevices.map((d) => d.id));
    if (knownIds.has(device.id)) {
      score -= 30;
    }

    if (device.isTrusted) {
      score -= 50;
    }

    if (device.riskScore > 0) {
      score += device.riskScore;
    }

    if (device.os === 'Unknown') {
      score += 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getDeviceType(ua: string): DeviceInfo['type'] {
    if (/Mobile|Android.*Mobile|iPhone|iPod/.test(ua)) return 'mobile';
    if (/Tablet|iPad|Android(?!.*Mobile)/.test(ua)) return 'tablet';
    return 'desktop';
  }

  private getOS(ua: string): string {
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    if (/Android/.test(ua)) return 'Android';
    if (/iOS/.test(ua)) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(ua: string): string {
    if (/Edg/.test(ua)) return 'Edge';
    if (/Chrome/.test(ua)) return 'Chrome';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Safari/.test(ua)) return 'Safari';
    return 'Unknown';
  }

  private getDeviceName(ua: string): string {
    const brandMatch = ua.match(/\(([^)]+)\)/);
    return brandMatch ? brandMatch[1]!.split(';')[0]!.trim() : 'Unknown Device';
  }
}
