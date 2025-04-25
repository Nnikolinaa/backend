import { Router } from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../db';
import { Vehicle } from '../entities/Vehicle';

const router = Router();

// Get all vehicles
router.get('/vehicles', async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicleRepository = AppDataSource.getRepository(Vehicle);
    const vehicles = await vehicleRepository.find();
    res.json(vehicles); // Ensure all fields are included in the response
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a vehicle by ID
router.get('/vehicles/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicleRepository = AppDataSource.getRepository(Vehicle);
    if (!id) {
      res.status(400).json({ message: 'Invalid vehicle ID' });
      return;
    }
    const vehicle = await vehicleRepository.findOneBy({ vehicleId: parseInt(id, 10) });

    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;