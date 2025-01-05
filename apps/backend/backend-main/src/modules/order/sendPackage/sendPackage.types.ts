export type ILocation = {
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
  pickupLocation: ILocation;
  dropLocation: ILocation;
  estimatedDistance: number;
  estimatedTime: number;
  customerId: number;
  price?: number;
};
