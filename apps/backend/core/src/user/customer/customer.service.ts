
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class CustomerService {
  async create(customer: any, user_id: string) {
    try {
    //  validateSchema(CreateCustomerDto,customer );
      // Add your create logic here
      return `This action adds a new customer`;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async update(id: string, customer: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} customer`;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all customer`;
    } catch (error) {
      throw new Error(`Failed to fetch customer records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} customer`;
    } catch (error) {
      throw new Error(`Failed to fetch customer record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} customer`;
    } catch (error) {
      throw new Error(`Failed to remove customer: ${error.message}`);
    }
  }
}
