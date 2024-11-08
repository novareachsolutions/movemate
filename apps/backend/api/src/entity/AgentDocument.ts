import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Agent } from './Agent';
import { RequiredDoc } from './RequiredDoc';

@Entity()
@Unique(['agent', 'requiredDoc'])
export class AgentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Agent, (agent) => agent.agentDocuments, {
    onDelete: 'CASCADE',
  })
  agent: Agent;

  @ManyToOne(() => RequiredDoc, (requiredDoc) => requiredDoc.agentDocuments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  requiredDoc: RequiredDoc;

  @Column()
  url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
}
