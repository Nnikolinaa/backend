import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as configDotenv } from 'dotenv';
import { Vehicle } from './entities/Vehicle';
import { User } from './entities/User';
import { Rental } from './entities/Rental'; // Import the Rental entity
import { Payment } from './entities/Payment'; // Import the Payment entity
configDotenv();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined, // Dynamically use the port from .env
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Disable synchronization in production
  logging: false,
  entities: [
    User, // Ensure User is included here
    Vehicle,
    Rental, // Register the Rental entity
    Payment
  ],
});

AppDataSource.initialize()
  .then(() => {
    console.log(`Connected to MySQL database (${process.env.DB_NAME}) on port ${process.env.DB_PORT}.`);
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
  });
