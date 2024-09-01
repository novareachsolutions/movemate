
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class OrderItemService {
  async create(orderitem: any, user_id: string) {
    try {
    //  validateSchema(CreateOrderItemDto,orderitem );
      // Add your create logic here
      return `This action adds a new orderitem`;
    } catch (error) {
      throw new Error(`Failed to create orderitem: ${error.message}`);
    }
  }

  async update(id: string, orderitem: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} orderitem`;
    } catch (error) {
      throw new Error(`Failed to update orderitem: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all orderitem`;
    } catch (error) {
      throw new Error(`Failed to fetch orderitem records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} orderitem`;
    } catch (error) {
      throw new Error(`Failed to fetch orderitem record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} orderitem`;
    } catch (error) {
      throw new Error(`Failed to remove orderitem: ${error.message}`);
    }
  }
}
