import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import onboardingRoutes from './routes/onboarding.routes';
import businessRoutes from './routes/business.routes';
import interestRoutes from './routes/interest.routes';
import businessProfileRoutes from './routes/businessProfile.routes';

// Import error handler
import { errorHandler } from './middlewares/errorHandler.middleware';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ;

// Middleware
// Configure CORS
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running!!!');
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/business', businessProfileRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
