export interface ShopSettings {
  whatsapp: {
    number: string;
  };
  delivery: {
    charge: number;
    freeAbove: number;
  };
  serviceablePincodes: string[];
  shopInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface DeliveryCharge {
  amount: number;
  freeAbove: number;
}
