export type TLocation = {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
};

export type TSendPackageOrder = {
  senderName: string;
  senderPhoneNumber: string;
  receiverName: string;
  receiverPhoneNumber: string;
  packageType: string;
  deliveryInstructions?: string;
  pickupLocation: TLocation;
  dropLocation: TLocation;
  estimatedDistance: number;
  estimatedTime: string;
  customerId: number;
  price?: number;
};
