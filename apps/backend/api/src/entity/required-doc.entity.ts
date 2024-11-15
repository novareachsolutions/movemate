import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AgentType } from 'src/shared/utils/agent.enum';
import { AgentDocument } from './agent-document.entity';

@Entity()
export class RequiredDoc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AgentType })
  agentType: AgentType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => AgentDocument, agentDocument => agentDocument.requiredDoc)
  riderDocuments: AgentDocument[];
}