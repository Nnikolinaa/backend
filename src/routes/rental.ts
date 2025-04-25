import { Router } from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../db';
import { Rental } from '../entities/Rental';
import { Vehicle } from '../entities/Vehicle';

const router = Router();

// Book a vehicle
router.post('/rentals', async (req: Request, res: Response): Promise<void> => {
  const { userId, vehicleId, startDate, endDate, totalPrice } = req.body;

  // Validate request body
  if (!userId || !vehicleId || !startDate || !endDate || !totalPrice) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  try {
    const rentalRepository = AppDataSource.getRepository(Rental);
    const newRental = rentalRepository.create({
      userId,
      vehicleId,
      startDate,
      endDate,
      totalPrice,
    });
    await rentalRepository.save(newRental);

    res.status(201).json({ message: 'Vehicle booked successfully.' });
  } catch (error) {
    console.error('Error booking vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rentals for a user
router.get('/rentals/user/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const rentalRepository = AppDataSource.getRepository(Rental);
    const rentals = await rentalRepository.find({
      where: { userId: userId ? parseInt(userId, 10) : 0 },
      relations: ['vehicle'],
    });

    res.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update rental status
router.patch('/rentals/:rentalId', async (req: Request, res: Response): Promise<void> => {
  const { rentalId } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }

  try {
    const rentalRepository = AppDataSource.getRepository(Rental);
    if (!rentalId) {
      res.status(400).json({ error: 'Rental ID is required.' });
      return;
    }
    const rental = await rentalRepository.findOneBy({ rentalId: parseInt(rentalId, 10) });

    if (!rental) {
      res.status(404).json({ error: 'Rental not found.' });
      return;
    }

    rental.status = status;
    await rentalRepository.save(rental);

    res.status(200).json({ message: 'Rental status updated successfully.' });
  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rental details by rental ID
router.get('/rentals/:rentalId', async (req: Request, res: Response): Promise<void> => {
  const { rentalId } = req.params;

  try {
    const rentalRepository = AppDataSource.getRepository(Rental);
    const rental = await rentalRepository.findOne({
      where: { rentalId: rentalId ? parseInt(rentalId, 10) : 0 },
      relations: ['vehicle'],
    });

    if (!rental) {
      res.status(404).json({ error: 'Rental not found.' });
      return;
    }

    res.json({
      rentalId: rental.rentalId,
      userId: rental.userId,
      startDate: rental.startDate,
      endDate: rental.endDate,
      totalPrice: rental.totalPrice,
      vehicleName: rental.vehicle?.name,
      vehicleImage: rental.vehicle?.imagePath,
    });
  } catch (error) {
    console.error('Error fetching rental details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a rental for a given user ID and rental ID
router.delete('/rentals/:rentalId/user/:userId', async (req: Request, res: Response): Promise<void> => {
  const { rentalId, userId } = req.params;

  try {
    const rentalRepository = AppDataSource.getRepository(Rental);
    const rental = await rentalRepository.findOne({
      where: {
        rentalId: rentalId ? parseInt(rentalId, 10) : undefined,
        userId: userId ? parseInt(userId, 10) : undefined,
      },
    });

    if (!rental) {
      res.status(404).json({ error: 'Rental not found or does not belong to the user.' });
      return;
    }

    await rentalRepository.remove(rental);

    res.status(200).json({ message: 'Rental deleted successfully.' });
  } catch (error) {
    console.error('Error deleting rental:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
