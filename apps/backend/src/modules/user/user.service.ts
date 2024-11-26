import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { User } from "../../entity/User";
import { TCreateUser, TUpdateUser, TGetUserProfile } from "./user.types";
import { UpdateResult, DeleteResult } from "typeorm";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { logger } from "../../logger";
import { filterEmptyValues } from "../../utils/filter";

@Injectable()
export class UserService {
  /**
   * Create a new user.
   * @param createUserDto Data Transfer Object for creating a user.
   * @returns The created user entity.
   */
  async createUser(createUserDto: TCreateUser): Promise<User> {
    const { email, phoneNumber } = createUserDto;

    // Check if email or phone number already exists
    const existingUser = await dbReadRepo(User).findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      logger.error(
        `UserService.createUser: User with email ${email} or phone number ${phoneNumber} already exists.`
      );
      throw new BadRequestException(
        `User with the provided email or phone number already exists.`
      );
    }

    const user = dbRepo(User).create(createUserDto);
    return await dbRepo(User).save(user);
  }

  /**
   * Get a user by ID.
   * @param id User ID.
   * @returns The user entity.
   */
  async getUserById(id: number): Promise<User> {
    const user = await dbReadRepo(User).findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  /**
   * Get a user profile based on specific criteria.
   * @param getUserProfileDto Data Transfer Object for retrieving user profile.
   * @returns The user entity.
   */
  async getUserProfile(getUserProfileDto: TGetUserProfile): Promise<User> {
    const filteredInput = filterEmptyValues(getUserProfileDto);
    const user = await dbReadRepo(User).findOne({
      where: filteredInput,
    });

    if (!user) {
      throw new NotFoundException(
        `No user found with the provided details: ${JSON.stringify(
          getUserProfileDto
        )}`
      );
    }

    return user;
  }

  /**
   * Retrieve all users.
   * @returns An array of user entities.
   */
  async getAllUsers(): Promise<User[]> {
    return await dbReadRepo(User).find();
  }

  /**
   * Update a user's profile.
   * @param id User ID.
   * @param updateUserDto Data Transfer Object for updating user.
   * @returns The result of the update operation.
   */
  async updateUser(
    id: number,
    updateUserDto: TUpdateUser
  ): Promise<UpdateResult> {
    const user = await dbReadRepo(User).findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const filteredUpdateUser = filterEmptyValues(updateUserDto);
    logger.debug(
      `Updating user with ID ${id} with data: ${JSON.stringify(filteredUpdateUser)}`
    );

    return await dbRepo(User).update(id, filteredUpdateUser);
  }

  /**
   * Delete a user.
   * @param id User ID.
   * @returns The result of the delete operation.
   */
  async deleteUser(id: string): Promise<DeleteResult> {
    logger.debug(`Deleting user with ID ${id}`);
    return await dbRepo(User).softDelete(id);
  }
}
