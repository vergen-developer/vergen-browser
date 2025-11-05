import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import paymentRoutes from './routes/payment';
import subscriptionRoutes from './routes/subscription';
import proxyRoutes from './routes/proxy';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  paymentRoutes
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: 'Troppe richieste da questo IP, riprova più tardi',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/proxy', proxyRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VerGen Browser API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.APP_URL || 'http://localhost:5173'}`);
});

export default app;
