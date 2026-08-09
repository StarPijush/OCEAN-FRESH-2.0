/**
 * Shared business settings for OceanFresh.
 *
 * The DATABASE (shop_settings row 'default') is the source of truth — the
 * storefront reads it via SettingsRepository and the admin Settings page
 * writes it. These constants are bootstrap DEFAULTS used only for the first
 * render before settings load and as per-field fallbacks when a field is
 * NULL in the database. Never treat them as the runtime source of truth.
 */
export interface StoreSettings {
  storeName: string;
  tagline: string;
  /** International format, digits only — used to build wa.me links. */
  whatsapp: string;
  /** Display phone, e.g. "+91 98765 43210". */
  phoneDisplay: string;
  /** Raw dialable phone, e.g. "+919876543210". */
  phoneRaw: string;
  email: string;
  addressLines: string[];
  /** Shop hours: [weekdays, sunday]. */
  hours: string[];
  /** Free delivery above this subtotal (INR). */
  freeDeliveryAbove: number;
  /** Flat delivery fee (INR) below the threshold. */
  deliveryFee: number;
  /** Serviceable pincodes. */
  pincodes: string[];
  /** Serviceable area names. */
  deliveryAreas: string[];
  /** Delivery radius in kilometres. */
  deliveryRadius: number;
  /** Place order via WhatsApp to this number. */
  orderWhatsApp: string;
  foundedYear: number;
}

export const STORE_SETTINGS: StoreSettings = {
  storeName: 'OceanFresh',
  tagline: 'Fresh Seafood · Jhargram, West Bengal',
  whatsapp: '918509597935',
  phoneDisplay: '+91 85095 97935',
  phoneRaw: '+918509597935',
  email: 'hello@oceanfresh.in',
  addressLines: ['Shop No. 12, Fish Market', 'Jhargram, West Bengal 721507'],
  hours: ['Mon\u2013Sat \u00b7 6AM \u2013 9PM', 'Sunday \u00b7 6AM \u2013 2PM'],
  freeDeliveryAbove: 500,
  deliveryFee: 40,
  pincodes: [
    '721501',
    '721502',
    '721503',
    '721504',
    '721505',
    '721506',
    '721507',
    '721508',
    '721509',
    '721513',
    '721514',
    '721515',
    '721516',
    '721517',
    '721518',
    '721520',
    '721521',
    '721527',
  ],
  deliveryAreas: [
    'Jamboni',
    'Binpur',
    'Gopiballavpur',
    'Belpahari',
    'Nayagram',
    'Sankrail',
    'Rohini',
    'Silda',
    'Gidhni',
    'Lodhasuli',
  ],
  deliveryRadius: 15,
  orderWhatsApp: '918509597935',
  foundedYear: 2018,
};
