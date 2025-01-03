import { AgentStatusEnum, AgentTypeEnum } from "../../shared/enums";
import { TCreateUser, TUpdateUser } from "../user/user.types";

export type TAgent = {
  user: TCreateUser;
  agentType: AgentTypeEnum;
  abnNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  profilePhoto?: string;
  status: AgentStatusEnum;
};

export type TAgentPartial = {
  user?: TUpdateUser;
  agentType?: AgentTypeEnum;
  abnNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  profilePhoto?: string;
  status?: AgentStatusEnum;
};

export type TAgentDocument = {
  name: string;
  description?: string;
  url: string;
  agentId?: number;
  expiry?: Date;
};
