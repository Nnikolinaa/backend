import { Router } from 'express';
import { AppDataSource } from '../db';
import { User } from '../entities/User';
import { Timestamp } from 'typeorm';
import { UserService } from '../services/user.service';
import bcrypt from 'bcrypt';
const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    res.json(await UserService.login(req.body))
}
catch(e:any) {
    res.status(401).json({
        message: e.message,
        timestamp: new Date()
    })
}
});


router.post('/signup', async (req, res) => {
  const { email, password, phone } = req.body;

  // Validate request body
  if (!email || !password || !phone) {
    res.status(400).json({ error: 'All fields (email, password, phone) are required.' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);


    const userRepository = AppDataSource.getRepository(User);
    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      phone,
      createdAt: new Date(),
    });
    await userRepository.save(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get a user by ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ userId: parseInt(id, 10) });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/logout', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required.' });
    return;
  }

  try {
    await UserService.logout(userId);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    const token = auth && auth.split(' ')[1];

    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }

    const refreshedTokens = await UserService.refreshToken(token);
    res.json(refreshedTokens);
  } catch (e: any) {
    console.error('Refresh token error:', e.message); // Debugging log

    if (e.message === 'REFRESH_TOKEN_EXPIRED') {
      res.status(401).json({
        message: 'Refresh token has expired. Please log in again.',
        timestamp: new Date(),
      });
    } else if (e.message === 'INVALID_REFRESH_TOKEN') {
      res.status(401).json({
        message: 'Invalid refresh token. Please log in again.',
        timestamp: new Date(),
      });
    } else {
      res.status(500).json({
        message: 'Failed to refresh token. Please try again later.',
        timestamp: new Date(),
      });
    }
  }
});


router.post('/register', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const result = await UserService.register({ email, phone, password });
    res.status(201).json(result); // Return the userId of the newly created user
  } catch (error) {
    console.error('Registration error:', error);
    if ((error as any).message === 'USER_EXISTS') {
      res.status(409).json({ message: 'User already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});
  

export default router;
