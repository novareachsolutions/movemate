import { RoleEnum } from "../enums";

// Customer interface
interface Customer {
  id?: string;
  userid?: string;
  name: string;
  phoneNumber: string;
  address: string;
  orders: string[];
}

// Rider interface
interface Rider {
  id?: string;
  userid?: string;
  name: string;
  phoneNumber: string;
  vehicleType: string;
  licenseNumber: string;
  currentLocation?: string;
  activeOrders: string[];
  earnings: string[];
}

// ShopOwner interface
interface ShopOwner {
  id?: string;
  userid?: string;
  name: string;
  phoneNumber: string;
  shops: string[];
}

// RestaurantOwner interface
interface RestaurantOwner {
  id?: string;
  userid?: string;
  name: string;
  phoneNumber: string;
  restaurants: string[];
}

// Admin interface
interface Admin {
  id?: string;
  userid?: string;
  name: string;
  department: string;
  permissions: string[];
}

// User interface
interface User {
  id?: string;
  email: string;
  passwordHash: string;
  role: RoleEnum;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  rider?: Rider;
  shopOwner?: ShopOwner;
  restaurantOwner?: RestaurantOwner;
  admin?: Admin;
}

export { Admin, Customer, RestaurantOwner, Rider, ShopOwner, User };
