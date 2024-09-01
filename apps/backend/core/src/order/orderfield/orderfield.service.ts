
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class OrderFieldService {
  async create(orderfield: any, user_id: string) {
    try {
    //  validateSchema(CreateOrderFieldDto,orderfield );
      // Add your create logic here
      return `This action adds a new orderfield`;
    } catch (error) {
      throw new Error(`Failed to create orderfield: ${error.message}`);
    }
  }

  async update(id: string, orderfield: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} orderfield`;
    } catch (error) {
      throw new Error(`Failed to update orderfield: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all orderfield`;
    } catch (error) {
      throw new Error(`Failed to fetch orderfield records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} orderfield`;
    } catch (error) {
      throw new Error(`Failed to fetch orderfield record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} orderfield`;
    } catch (error) {
      throw new Error(`Failed to remove orderfield: ${error.message}`);
    }
  }
}
