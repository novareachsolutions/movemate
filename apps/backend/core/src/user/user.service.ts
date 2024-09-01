
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class UserService {
  async create(user: any) {
    try {
    //  validateSchema(CreateUserDto,user );
      // Add your create logic here
      return `This action adds a new user`;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async update(id: string, user: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} user`;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all user`;
    } catch (error) {
      throw new Error(`Failed to fetch user records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} user`;
    } catch (error) {
      throw new Error(`Failed to fetch user record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} user`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }
}
