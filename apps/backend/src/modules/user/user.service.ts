import { Injectable, BadRequestException } from "@nestjs/common";
import { User } from "../../entity/User";
import { TCreateUser, TUpdateUser, TGetUserProfile } from "./user.types";
import { UpdateResult, DeleteResult } from "typeorm";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { logger } from "../../logger";
import { filterEmptyValues } from "../../utils/filter";
import { UserNotFoundError } from "../../shared/errors/user";

@Injectable()
export class UserService {
  /**
   * Create a new user.
   * @param createUserDto Data Transfer Object for creating a user.
   * @returns The created user entity.
   */
  async createUser(createUserDto: TCreateUser): Promise<number> {
    const { email, phoneNumber } = createUserDto;

    const existingUser = await dbReadRepo(User).findOne({
      where: { email, phoneNumber },
    });

    if (existingUser) {
      logger.error(
        `UserService.createUser: User with email ${email} or phone number ${phoneNumber} already exists.`
      );
      throw new BadRequestException(
        `User with the provided email or phone number already exists.`
      );
    }

    const user: Pick<User, "id"> = await dbRepo(User).save(createUserDto);
    return user.id;
  }

  /**
   * Get a user by ID.
   * @param id User ID.
   * @returns The user entity.
   */
  async getUserById(id: number): Promise<User> {
    return await dbReadRepo(User).findOneOrFail({
      where: { id },
    });
  }

  /**
   * Get a user profile based on specific criteria.
   * @param getUserProfileDto Data Transfer Object for retrieving user profile.
   * @returns The user entity.
   */
  async getUserProfile(getUserProfileDto: TGetUserProfile): Promise<User> {
    const filteredInput = filterEmptyValues(getUserProfileDto);
    return await dbReadRepo(User).findOneOrFail({
      where: filteredInput,
    });
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
      throw new UserNotFoundError(`User with ID ${id} not found.`);
    }

    const filteredUpdateUser = filterEmptyValues(updateUserDto);
    logger.info(
      `UserService.updateUser: Updating user with ID ${id} with data: ${JSON.stringify(filteredUpdateUser)}`
    );

    return await dbRepo(User).update(id, filteredUpdateUser);
  }

  /**
   * Delete a user.
   * @param id User ID.
   * @returns The result of the delete operation.
   */
  async deleteUser(id: string): Promise<DeleteResult> {
    logger.info(`UserService.deleteUser: Deleting user with ID ${id}`);
    return await dbRepo(User).softDelete(id);
  }
}
