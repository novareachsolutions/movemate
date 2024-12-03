import { UserRoleEnum } from "../../shared/enums";

/**
 * Data Transfer Object for creating a user.
 */
export type TCreateUser = {
  phoneNumber: string;
  role: UserRoleEnum;
  firstName: string;
  lastName?: string;
  email: string;
  street?: string;
  suburb?: string;
  state?: string;
  postalCode?: number;
};

/**
 * Data Transfer Object for updating a user.
 */
export type TUpdateUser = {
  phoneNumber?: string;
  role?: UserRoleEnum;
  firstName?: string;
  lastName?: string;
  email?: string;
  street?: string;
  suburb?: string;
  state?: string;
  postalCode?: number;
};

/**
 * Data Transfer Object for retrieving user profile based on specific criteria.
 */
export type TGetUserProfile = {
  email?: string;
  phoneNumber?: string;
};
