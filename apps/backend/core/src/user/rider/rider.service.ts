
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class RiderService {
  async create(rider: any, user_id: string) {
    try {
    //  validateSchema(CreateRiderDto,rider );
      // Add your create logic here
      return `This action adds a new rider`;
    } catch (error) {
      throw new Error(`Failed to create rider: ${error.message}`);
    }
  }

  async update(id: string, rider: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} rider`;
    } catch (error) {
      throw new Error(`Failed to update rider: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all rider`;
    } catch (error) {
      throw new Error(`Failed to fetch rider records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} rider`;
    } catch (error) {
      throw new Error(`Failed to fetch rider record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} rider`;
    } catch (error) {
      throw new Error(`Failed to remove rider: ${error.message}`);
    }
  }
}
