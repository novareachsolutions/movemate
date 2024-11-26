import { UserRoleEnum } from "../../shared/enums";

/**
 * Data Transfer Object for creating a user.
 */
export interface TCreateUser {
  phoneNumber: string;
  role: UserRoleEnum;
  firstName: string;
  lastName?: string;
  email: string;
  street?: string;
  suburb?: string;
  state?: string;
  postalCode?: number;
  // Add other necessary fields
}

/**
 * Data Transfer Object for updating a user.
 */
export interface TUpdateUser {
  phoneNumber?: string;
  role?: UserRoleEnum;
  firstName?: string;
  lastName?: string;
  email?: string;
  street?: string;
  suburb?: string;
  state?: string;
  postalCode?: number;
  // Add other fields that can be updated
}

/**
 * Data Transfer Object for retrieving user profile based on specific criteria.
 */
export interface TGetUserProfile {
  email?: string;
  phoneNumber?: string;
  // Add other criteria as needed
}
