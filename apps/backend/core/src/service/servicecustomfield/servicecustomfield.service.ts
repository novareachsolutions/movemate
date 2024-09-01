
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ServiceCustomFieldService {
  async create(servicecustomfield: any, user_id: string) {
    try {
    //  validateSchema(CreateServiceCustomFieldDto,servicecustomfield );
      // Add your create logic here
      return `This action adds a new servicecustomfield`;
    } catch (error) {
      throw new Error(`Failed to create servicecustomfield: ${error.message}`);
    }
  }

  async update(id: string, servicecustomfield: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} servicecustomfield`;
    } catch (error) {
      throw new Error(`Failed to update servicecustomfield: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all servicecustomfield`;
    } catch (error) {
      throw new Error(`Failed to fetch servicecustomfield records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} servicecustomfield`;
    } catch (error) {
      throw new Error(`Failed to fetch servicecustomfield record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} servicecustomfield`;
    } catch (error) {
      throw new Error(`Failed to remove servicecustomfield: ${error.message}`);
    }
  }
}
