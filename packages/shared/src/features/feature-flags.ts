export enum FeatureFlag {
  COUPONS = 'coupons',
  REVIEWS = 'reviews',
  PAYMENTS = 'payments',
  INVENTORY = 'inventory',
  ANALYTICS = 'analytics',
  DARK_MODE = 'darkMode',
  MAINTENANCE_MODE = 'maintenanceMode',
  EXPERIMENTAL_SEARCH = 'experimentalSearch',
  MULTI_VENDOR = 'multiVendor',
}

interface FeatureConfig {
  enabled: boolean;
  rolloutPercentage?: number;
  dependencies?: FeatureFlag[];
}

export class FeatureFlagManager {
  private flags: Map<FeatureFlag, FeatureConfig> = new Map();
  private overrides: Map<FeatureFlag, boolean> = new Map();
  private initialized = false;

  init(envFlags: Partial<Record<FeatureFlag, boolean>>): void {
    this.flags.set(FeatureFlag.COUPONS, { enabled: envFlags[FeatureFlag.COUPONS] ?? false });
    this.flags.set(FeatureFlag.REVIEWS, { enabled: envFlags[FeatureFlag.REVIEWS] ?? false });
    this.flags.set(FeatureFlag.PAYMENTS, { enabled: envFlags[FeatureFlag.PAYMENTS] ?? false });
    this.flags.set(FeatureFlag.INVENTORY, { enabled: envFlags[FeatureFlag.INVENTORY] ?? true });
    this.flags.set(FeatureFlag.ANALYTICS, { enabled: envFlags[FeatureFlag.ANALYTICS] ?? true });
    this.flags.set(FeatureFlag.MAINTENANCE_MODE, { enabled: envFlags[FeatureFlag.MAINTENANCE_MODE] ?? false });
    this.flags.set(FeatureFlag.DARK_MODE, { enabled: false });
    this.flags.set(FeatureFlag.MULTI_VENDOR, { enabled: false });
    this.flags.set(FeatureFlag.EXPERIMENTAL_SEARCH, { enabled: false });
    this.initialized = true;
  }

  isEnabled(flag: FeatureFlag): boolean {
    if (this.overrides.has(flag)) {
      return this.overrides.get(flag)!;
    }

    const config = this.flags.get(flag);
    if (!config) return false;

    if (config.dependencies) {
      for (const dep of config.dependencies) {
        if (!this.isEnabled(dep)) return false;
      }
    }

    return config.enabled;
  }

  setOverride(flag: FeatureFlag, enabled: boolean): void {
    this.overrides.set(flag, enabled);
  }

  clearOverrides(): void {
    this.overrides.clear();
  }

  reset(): void {
    this.flags.clear();
    this.overrides.clear();
    this.initialized = false;
  }
}

export const featureFlags = new FeatureFlagManager();
