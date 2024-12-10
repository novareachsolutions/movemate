import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Store extends BaseEntity {
    @Column({ type: 'varchar', length: 255, nullable: false })
    storeName: string;

    @Column({ type: 'float', nullable: false })
    latitude: number;

    @Column({ type: 'float', nullable: false })
    longitude: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    addressLine1: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    addressLine2: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    landmark: string;
}
