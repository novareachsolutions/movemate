
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ServiceTypeVersionService {
  async create(servicetypeversion: any, user_id: string) {
    try {
    //  validateSchema(CreateServiceTypeVersionDto,servicetypeversion );
      // Add your create logic here
      return `This action adds a new servicetypeversion`;
    } catch (error) {
      throw new Error(`Failed to create servicetypeversion: ${error.message}`);
    }
  }

  async update(id: string, servicetypeversion: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} servicetypeversion`;
    } catch (error) {
      throw new Error(`Failed to update servicetypeversion: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all servicetypeversion`;
    } catch (error) {
      throw new Error(`Failed to fetch servicetypeversion records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} servicetypeversion`;
    } catch (error) {
      throw new Error(`Failed to fetch servicetypeversion record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} servicetypeversion`;
    } catch (error) {
      throw new Error(`Failed to remove servicetypeversion: ${error.message}`);
    }
  }
}
