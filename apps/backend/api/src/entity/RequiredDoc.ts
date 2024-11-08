import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AgentDocument } from './AgentDocument';

@Entity()
export class RequiredDoc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(
    () => AgentDocument,
    (agentDocument) => agentDocument.requiredDoc,
    { cascade: true },
  )
  agentDocuments: AgentDocument[];
}
