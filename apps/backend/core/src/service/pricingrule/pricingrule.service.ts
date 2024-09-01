
import { Injectable } from '@nestjs/common';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class PricingRuleService {
  async create(pricingrule: any, user_id: string) {
    try {
    //  validateSchema(CreatePricingRuleDto,pricingrule );
      // Add your create logic here
      return `This action adds a new pricingrule`;
    } catch (error) {
      throw new Error(`Failed to create pricingrule: ${error.message}`);
    }
  }

  async update(id: string, pricingrule: any, user_id: string) {
    try {
      // Add your update logic here
      return `This action updates a #${id} pricingrule`;
    } catch (error) {
      throw new Error(`Failed to update pricingrule: ${error.message}`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return `This action returns all pricingrule`;
    } catch (error) {
      throw new Error(`Failed to fetch pricingrule records: ${error.message}`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return `This action returns a #${id} pricingrule`;
    } catch (error) {
      throw new Error(`Failed to fetch pricingrule record: ${error.message}`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return `This action removes a #${id} pricingrule`;
    } catch (error) {
      throw new Error(`Failed to remove pricingrule: ${error.message}`);
    }
  }
}
