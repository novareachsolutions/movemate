import { OrderStatusEnum } from "../enums";

interface Order {
  id: string;
  serviceId: string;
  customerId: string;
  riderId?: string;
  status: OrderStatusEnum;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: string[];
  orderFields: string[];
  paymentId?: string;
  tracking?: string;
}

export { Order };
