
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class AdminService {
  async create(admin: any, user_id: string) {
    try {
    //  validateSchema(CreateAdminDto,admin );
      // Add your create logic here
      return `This action adds a new admin`;
    } catch (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  async update(id: string, admin: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} admin`;
    } catch (error) {
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all admin`;
    } catch (error) {
      throw new Error(`Failed to fetch admin records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} admin`;
    } catch (error) {
      throw new Error(`Failed to fetch admin record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} admin`;
    } catch (error) {
      throw new Error(`Failed to remove admin: ${error.message}`);
    }
  }
}
