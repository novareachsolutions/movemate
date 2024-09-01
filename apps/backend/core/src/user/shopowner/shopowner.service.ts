
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ShopOwnerService {
  async create(shopowner: any, user_id: string) {
    try {
    //  validateSchema(CreateShopOwnerDto,shopowner );
      // Add your create logic here
      return `This action adds a new shopowner`;
    } catch (error) {
      throw new Error(`Failed to create shopowner: ${error.message}`);
    }
  }

  async update(id: string, shopowner: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} shopowner`;
    } catch (error) {
      throw new Error(`Failed to update shopowner: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all shopowner`;
    } catch (error) {
      throw new Error(`Failed to fetch shopowner records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} shopowner`;
    } catch (error) {
      throw new Error(`Failed to fetch shopowner record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} shopowner`;
    } catch (error) {
      throw new Error(`Failed to remove shopowner: ${error.message}`);
    }
  }
}
