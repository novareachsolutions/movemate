
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ServiceTypeFieldService {
  async create(servicetypefield: any, user_id: string) {
    try {
    //  validateSchema(CreateServiceTypeFieldDto,servicetypefield );
      // Add your create logic here
      return `This action adds a new servicetypefield`;
    } catch (error) {
      throw new Error(`Failed to create servicetypefield: ${error.message}`);
    }
  }

  async update(id: string, servicetypefield: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} servicetypefield`;
    } catch (error) {
      throw new Error(`Failed to update servicetypefield: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all servicetypefield`;
    } catch (error) {
      throw new Error(`Failed to fetch servicetypefield records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} servicetypefield`;
    } catch (error) {
      throw new Error(`Failed to fetch servicetypefield record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} servicetypefield`;
    } catch (error) {
      throw new Error(`Failed to remove servicetypefield: ${error.message}`);
    }
  }
}
