import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { AgentProfile } from './agent-profile.entity';
import { RequiredDoc } from './required-doc.entity';

@Entity()
export class AgentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AgentProfile, agentProfile => agentProfile.riderDocuments)
  agentProfile: AgentProfile;

  @ManyToOne(() => RequiredDoc, requiredDoc => requiredDoc.riderDocuments)
  requiredDoc: RequiredDoc;

  @Column()
  url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}