import { Column, Entity } from "typeorm";

import { BaseEntity } from "./BaseEntity";

@Entity()
export class PickupLocation extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  addressLine1: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  addressLine2: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  landmark: string;

  @Column({ type: "float" })
  latitude: number;

  @Column({ type: "float" })
  longitude: number;
}
