
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ServiceService {
  async create(service: any, user_id: string) {
    try {
    //  validateSchema(CreateServiceDto,service );
      // Add your create logic here
      return `This action adds a new service`;
    } catch (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  async update(id: string, service: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} service`;
    } catch (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all service`;
    } catch (error) {
      throw new Error(`Failed to fetch service records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} service`;
    } catch (error) {
      throw new Error(`Failed to fetch service record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} service`;
    } catch (error) {
      throw new Error(`Failed to remove service: ${error.message}`);
    }
  }
}
