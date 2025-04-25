import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Vehicle } from "./Vehicle";
import { User } from "./User";

@Entity("rental") // Ensure this matches the table name in your database
export class Rental {
  @PrimaryGeneratedColumn({ type: "int", name: "rental_id" })
  rentalId: number;

  @Column("int", { name: "user_id", unsigned: true }) // Ensure this matches the database schema
  userId: number;

  @Column("int", { name: "vehicle_id", unsigned: true }) // Ensure this matches the database schema
  vehicleId: number;

  @Column("datetime", { name: "start_date", nullable: true })
  startDate: Date;

  @Column("datetime", { name: "end_date", nullable: true })
  endDate: Date;

  @Column("decimal", { name: "total_price", precision: 10, scale: 2 })
  totalPrice: number;

  @Column("varchar", { name: "status", length: 50, default: "pending" })
  status: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.rentals)
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Vehicle;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
