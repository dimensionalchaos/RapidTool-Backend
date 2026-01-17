import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import modelImportRoutes from './routes/modelImport.routes';
import exportRoutes from './routes/export.routes';
import licenseRoutes from './routes/license.routes';
import { validateAuthConfig } from './config/auth.config';

dotenv.config();

// Validate auth configuration in production
validateAuthConfig();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localtest.me:5173',
      'http://localtest.me:8080',
      'http://localtest.me:8081',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081'
    ].filter(Boolean); // Remove undefined/null

    // Check if origin is allowed
    // 1. Exact match in whitelist
    // 2. Local network IP (192.168.x.x or 10.x.x.x)
    // 3. Applied Additive domains (main and subdomains)
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://localhost') ||
      origin.endsWith('.appliedadditive.com') ||
      origin === 'https://appliedadditive.com' ||
      origin === 'http://appliedadditive.com' ||
      origin === 'appliedadditive.com' ||
      origin === 'http://portal.appliedadditive.com' ||
      origin === 'https://portal.appliedadditive.com' ||
      origin === 'portal.appliedadditive.com' ||
      origin === 'http://fixtures.appliedadditive.com' ||
      origin === 'https://fixtures.appliedadditive.com' ||
      origin === 'fixtures.appliedadditive.com' ||
      origin === 'http://rapidtoolapi.appliedadditive.com' ||
      origin === 'https://rapidtoolapi.appliedadditive.com' ||
      origin === 'rapidtoolapi.appliedadditive.com' ||
      origin.endsWith('.trycloudflare.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/models', modelImportRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/license', licenseRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});

export default app;
