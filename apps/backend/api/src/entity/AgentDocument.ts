import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  RelationId,
} from 'typeorm';
import { Agent } from './Agent';
import { RequiredDoc } from './RequiredDoc';

@Entity()
@Unique(['agent', 'requiredDoc'])
export class AgentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Agent, (agent) => agent.agentDocuments, {
    onDelete: 'CASCADE',
  })
  agent: Agent;

  @RelationId((doc: AgentDocument) => doc.agent)
  agentId: number;

  @ManyToOne(() => RequiredDoc, (requiredDoc) => requiredDoc.agentDocuments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  requiredDoc: RequiredDoc;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
}
