import { AgentStatusEnum, AgentTypeEnum } from '../../shared/enums';

export type TAgent = {
  userId: number;
  agentType: AgentTypeEnum;
  abnNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  profilePhoto?: string;
  status: AgentStatusEnum;
};

export type TAgentPartial = {
  userId?: number;
  agentType?: AgentTypeEnum;
  abnNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  profilePhoto?: string;
  status?: AgentStatusEnum;
};

export type TGetAgentProfile = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
} & TAgentPartial;

export type TAgentDocument = {
  name: string;
  description?: string;
  url: string;
  agentId: number;
};
