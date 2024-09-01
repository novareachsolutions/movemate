
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class RestaurantOwnerService {
  async create(restaurantowner: any, user_id: string) {
    try {
    //  validateSchema(CreateRestaurantOwnerDto,restaurantowner );
      // Add your create logic here
      return `This action adds a new restaurantowner`;
    } catch (error) {
      throw new Error(`Failed to create restaurantowner: ${error.message}`);
    }
  }

  async update(id: string, restaurantowner: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} restaurantowner`;
    } catch (error) {
      throw new Error(`Failed to update restaurantowner: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all restaurantowner`;
    } catch (error) {
      throw new Error(`Failed to fetch restaurantowner records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} restaurantowner`;
    } catch (error) {
      throw new Error(`Failed to fetch restaurantowner record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} restaurantowner`;
    } catch (error) {
      throw new Error(`Failed to remove restaurantowner: ${error.message}`);
    }
  }
}
