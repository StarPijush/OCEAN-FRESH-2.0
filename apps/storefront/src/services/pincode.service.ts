export interface PincodeResult {
  isValid: boolean;
  isServiceable: boolean;
  message: string;
}

export const pincodeService = {
  validate(pincode: string, servicePincodes: string[]): PincodeResult {
    const cleaned = pincode.trim();
    if (cleaned.length !== 6) {
      return {
        isValid: false,
        isServiceable: false,
        message: 'Please enter a valid 6-digit PIN code.',
      };
    }
    const isServiceable = servicePincodes.includes(cleaned);
    return {
      isValid: true,
      isServiceable,
      message: isServiceable
        ? '\u2713 Delivery available \u00B7 Expected 2\u20133 hours'
        : '\u2715 Not delivering to this area yet \u2014 expanding soon.',
    };
  },
};
