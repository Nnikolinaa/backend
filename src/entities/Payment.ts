import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Rental } from "./Rental";

@Entity("payment", { schema: "sase_db" })
export class Payment {
  @PrimaryGeneratedColumn({ type: "int", name: "payment_id" })
  paymentId: number;

  @Column("int", { name: "rental_id" })
  rentalId: number;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;

  @Column("decimal", { name: "amount", precision: 10, scale: 2 })
  amount: number;

  @Column("varchar", { name: "payment_method", length: 50 })
  paymentMethod: string;

  @Column("varchar", { name: "transaction_id", length: 255 })
  transactionId: string;

  @Column("varchar", { name: "payment_status", length: 50, default: "pending" })
  paymentStatus: string;

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Rental)
  @JoinColumn({ name: "rental_id" })
  rental: Rental;
}
