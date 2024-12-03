import { Column, Entity, OneToOne, RelationId } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { SendPackageOrder } from "./Order/SendAPackage";

@Entity()
export class DropLocation extends BaseEntity {
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

  @OneToOne(() => SendPackageOrder, (sendPackageOrder) => sendPackageOrder.dropLocation)
  sendPackageOrder: SendPackageOrder;

  @RelationId((pickupLocation: DropLocation) => pickupLocation.sendPackageOrder)
  @Column({ type: "integer" })
  sendPackageOrderId: number;
}
