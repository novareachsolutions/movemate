import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

import { AgentStatusEnum, AgentTypeEnum, ApprovalStatusEnum } from "../enums";

export const AgentProfileResponse = (): any => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Agent profile retrieved successfully",
      schema: {
        example: {
          success: true,
          message: "Agent profile retrieved successfully",
          data: {
            id: 1,
            abnNumber: "12345678901",
            agentType: AgentTypeEnum.CAR_TOWING,
            vehicleMake: "Toyota",
            vehicleModel: "Hilux",
            vehicleYear: 2020,
            profilePhoto: "https://example.com/photo.jpg",
            status: AgentStatusEnum.ONLINE,
            approvalStatus: ApprovalStatusEnum.APPROVED,
            user: {
              id: 1,
              email: "agent@example.com",
              phoneNumber: "+61412345678",
            },
            createdAt: "2024-03-26T10:00:00.000Z",
            updatedAt: "2024-03-26T10:00:00.000Z",
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Agent not found",
      schema: {
        example: {
          success: false,
          message: "Agent not found for ID 1",
          statusCode: 404,
        },
      },
    }),
  );
};
