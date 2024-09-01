
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class FieldOptionService {
  async create(fieldoption: any, user_id: string) {
    try {
    //  validateSchema(CreateFieldOptionDto,fieldoption );
      // Add your create logic here
      return `This action adds a new fieldoption`;
    } catch (error) {
      throw new Error(`Failed to create fieldoption: ${error.message}`);
    }
  }

  async update(id: string, fieldoption: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} fieldoption`;
    } catch (error) {
      throw new Error(`Failed to update fieldoption: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all fieldoption`;
    } catch (error) {
      throw new Error(`Failed to fetch fieldoption records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} fieldoption`;
    } catch (error) {
      throw new Error(`Failed to fetch fieldoption record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} fieldoption`;
    } catch (error) {
      throw new Error(`Failed to remove fieldoption: ${error.message}`);
    }
  }
}
