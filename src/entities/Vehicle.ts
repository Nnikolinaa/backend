import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Rental } from "./Rental";

// Transformer to convert TINYINT to boolean and vice versa
const booleanTransformer = {
  to: (value: boolean): number => (value ? 1 : 0), // Convert boolean to TINYINT
  from: (value: number): boolean => !!value, // Convert TINYINT to boolean
};

@Entity("vehicle", { schema: "sase_db" })
export class Vehicle {
  @PrimaryGeneratedColumn({ type: "int", name: "vehicle_id", unsigned: true })
  vehicleId: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "image_path", length: 255 })
  imagePath: string;

  @Column("varchar", { name: "price", length: 45 })
  price: string;

  @Column("varchar", { name: "type", length: 45 })
  type: string;

  @Column("int", { name: "seats" })
  seats: number;

  @Column("varchar", { name: "brand", length: 45 })
  brand: string;

  @Column("enum", { name: "transmission", enum: ["Automatic", "Manual"] })
  transmission: "Automatic" | "Manual";

  @Column("enum", {
    name: "fuel_type",
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
  })
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid";

  @Column("int", { name: "horsepower" })
  horsepower: number;

  @Column("int", { name: "torque" })
  torque: number;

  @Column("float", { name: "acceleration", precision: 12 })
  acceleration: number;

  @Column("int", { name: "top_speed" })
  topSpeed: number;

  @Column("varchar", { name: "engine", length: 255 })
  engine: string;

  @Column("enum", {
    name: "interior_material",
    enum: [
      "Leather",
      "Alcantara",
      "Carbon",
      "Merino Leather",
      "Nappa Leather",
      "Bridge of Weir Leather",
    ],
  })
  interiorMaterial:
    | "Leather"
    | "Alcantara"
    | "Carbon"
    | "Merino Leather"
    | "Nappa Leather"
    | "Bridge of Weir Leather";

  @Column("tinyint", {
    name: "convertible",
    width: 1,
    transformer: booleanTransformer,
  })
  convertible: boolean;

  @Column("tinyint", {
    name: "has_heated_seats",
    width: 1,
    transformer: booleanTransformer,
  })
  hasHeatedSeats: boolean;

  @Column("tinyint", {
    name: "has_massage_seats",
    width: 1,
    transformer: booleanTransformer,
  })
  hasMassageSeats: boolean;

  @Column("varchar", { name: "color", length: 45 })
  color: string;

  @Column("json", { name: "features" })
  features: string[];

  @Column("int", { name: "year" })
  year: number;

  @Column("int", { name: "mileage" })
  mileage: number;

  @Column("tinyint", {
    name: "chauffeur_available",
    width: 1,
    transformer: booleanTransformer,
  })
  chauffeurAvailable: boolean;

  @Column("json", { name: "unavailable_dates" })
  unavailableDates: string[];

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @OneToMany(() => Rental, (rental) => rental.vehicle)
  rentals: Rental[];
}