import { Router } from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../db';
import { Payment } from '../entities/Payment';
import { Rental } from '../entities/Rental';
import { Vehicle } from '../entities/Vehicle';

const router = Router();

// Utility function to format dates as YYYY-MM-DD
function formatDate(date: Date | string): string {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// Create a payment
router.post('/payments', async (req: Request, res: Response): Promise<void> => {
  const { rentalId, userId, amount, paymentMethod, transactionId } = req.body;

  // Validate request body
  if (!rentalId || !userId || !amount || !paymentMethod) {
    res.status(400).json({ error: 'All fields (rentalId, userId, amount, paymentMethod) are required.' });
    return;
  }

  try {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const newPayment = paymentRepository.create({
      rentalId,
      userId,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus: 'pending',
    });
    await paymentRepository.save(newPayment);

    res.status(201).json({ message: 'Payment created successfully.' });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock payment process
router.post('/payments/mock', async (req: Request, res: Response): Promise<void> => {
  const { rentalId, userId, amount, paymentMethod } = req.body;

  // Validate request body
  if (!rentalId || !userId || !amount || !paymentMethod) {
    res.status(400).json({ error: 'All fields (rentalId, userId, amount, paymentMethod) are required.' });
    return;
  }

  try {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const rentalRepository = AppDataSource.getRepository(Rental);
    const vehicleRepository = AppDataSource.getRepository(Vehicle);

    // Simulate a transaction ID
    const transactionId = `MOCK-${Date.now()}`;

    // Create the payment
    const newPayment = paymentRepository.create({
      rentalId,
      userId,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus: 'completed',
    });
    await paymentRepository.save(newPayment);

    // Update the rental status to 'completed'
    const rental = await rentalRepository.findOneBy({ rentalId });
    if (rental) {
      rental.status = 'completed';
      await rentalRepository.save(rental);

      // Fetch the vehicle and update unavailable dates
      const vehicle = await vehicleRepository.findOneBy({ vehicleId: rental.vehicleId });
      if (vehicle) {
        const startDate = new Date(rental.startDate);
        const endDate = new Date(rental.endDate);

        // Generate all dates in the range
        const getDatesInRange = (start: Date, end: Date): string[] => {
          const dates: string[] = [];
          const currentDate = new Date(start);
          while (currentDate <= end) {
            dates.push(formatDate(new Date(currentDate)));
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return dates;
        };

        const newUnavailableDates = getDatesInRange(startDate, endDate);
        const currentUnavailableDates = vehicle.unavailableDates || [];
        const updatedUnavailableDates = Array.from(new Set([...currentUnavailableDates, ...newUnavailableDates]));

        vehicle.unavailableDates = updatedUnavailableDates;
        await vehicleRepository.save(vehicle);
      }
    }

    res.status(201).json({
      message: 'Mock payment processed successfully.',
      transactionId,
      paymentStatus: 'completed',
    });
  } catch (error) {
    console.error('Error processing mock payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payments for a user
router.get('/payments/user/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payments = await paymentRepository.find({
      where: { userId: userId ? parseInt(userId, 10) : 0 },
      relations: ['rental', 'rental.vehicle'],
    });

    const formattedPayments = payments.map((payment) => ({
      paymentId: payment.paymentId,
      rentalId: payment.rentalId,
      userId: payment.userId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      paymentStatus: payment.paymentStatus,
      createdAt: payment.createdAt,
      vehicleName: payment.rental?.vehicle?.name,
      startDate: payment.rental?.startDate,
      endDate: payment.rental?.endDate,
      totalPrice: payment.rental?.totalPrice,
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment status
router.patch('/payments/:paymentId', async (req: Request, res: Response): Promise<void> => {
  const { paymentId } = req.params;
  const { paymentStatus } = req.body;

  if (!paymentStatus) {
    res.status(400).json({ error: 'Payment status is required.' });
    return;
  }

  try {
    const paymentRepository = AppDataSource.getRepository(Payment);
    if (!paymentId) {
      res.status(400).json({ error: 'Payment ID is required.' });
      return;
    }
    const payment = await paymentRepository.findOneBy({ paymentId: parseInt(paymentId, 10) });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found.' });
      return;
    }

    payment.paymentStatus = paymentStatus;
    await paymentRepository.save(payment);

    res.status(200).json({ message: 'Payment status updated successfully.' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
