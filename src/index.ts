import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import signupRoute from './routes/signup';
import loginRoute from './routes/login';
import vehicleRoute from './routes/vehicle';
import userRoute from './routes/user';
import rentalRoute from './routes/rental';
import paymentRoute from './routes/payment';
import { UserService } from './services/user.service';
import https from 'https';
import fs from 'fs';
import { AppDataSource } from './db';
import {configDotenv} from 'dotenv';
const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://production-domain.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(morgan('tiny'));
app.use(express.json()); 

// Routes
app.use(UserService.verifyToken); // Middleware to verify token for all routes
app.use('/api', signupRoute);
app.use('/api', loginRoute);
app.use('/api', vehicleRoute); // Register the vehicle route
app.use('/api/user/', userRoute); // Register the user route
app.use('/api', rentalRoute); // Register the rental route
app.use('/api', paymentRoute); // Register the payment route

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const sslOptions = {
  key: fs.readFileSync('./src/crypto/key.pem'),
  cert: fs.readFileSync('./src./crypto/cert.pem'),
};

configDotenv()
AppDataSource.initialize()
.then(() => {
  console.log('Database connection established successfully!');
  const port = process.env.SERVER_PORT || 3000;

  https.createServer(sslOptions, app)
    .listen(port, () =>
     console.log(`Server running on http://localhost:${port}`)
  )

}).catch((error) => {
  console.error('Error during Data Source initialization:', error);
})