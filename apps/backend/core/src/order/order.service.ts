
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class OrderService {
  async create(order: any, user_id: string) {
    try {
    //  validateSchema(CreateOrderDto,order );
      // Add your create logic here
      return `This action adds a new order`;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async update(id: string, order: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} order`;
    } catch (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all order`;
    } catch (error) {
      throw new Error(`Failed to fetch order records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} order`;
    } catch (error) {
      throw new Error(`Failed to fetch order record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} order`;
    } catch (error) {
      throw new Error(`Failed to remove order: ${error.message}`);
    }
  }
}
