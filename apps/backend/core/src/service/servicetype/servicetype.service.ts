
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ServiceTypeService {
  async create(servicetype: any, user_id: string) {
    try {
    //  validateSchema(CreateServiceTypeDto,servicetype );
      // Add your create logic here
      return `This action adds a new servicetype`;
    } catch (error) {
      throw new Error(`Failed to create servicetype: ${error.message}`);
    }
  }

  async update(id: string, servicetype: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} servicetype`;
    } catch (error) {
      throw new Error(`Failed to update servicetype: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all servicetype`;
    } catch (error) {
      throw new Error(`Failed to fetch servicetype records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} servicetype`;
    } catch (error) {
      throw new Error(`Failed to fetch servicetype record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} servicetype`;
    } catch (error) {
      throw new Error(`Failed to remove servicetype: ${error.message}`);
    }
  }
}
