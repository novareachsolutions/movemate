export type IStore  = {
    storeName: string;
    latitude: number;
    longitude: number;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
  };
  
  export type ILocation = {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  };
  
  export type IItem = {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  };
  
  export type TBuyFromStoreOrder = {
    store: IStore;
    dropLocation: ILocation;
    deliveryInstructions?: string;
    estimatedDistance: number;
    estimatedTime: number;
    items: IItem[];
  };
  