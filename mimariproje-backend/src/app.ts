import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import path from 'path';
import { generalLimiter, authLimiter } from './middlewares/rateLimit.middleware';
import { xssSanitizer, securityHeaders, sqlInjectionDetector } from './middlewares/security.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import jobRoutes from './routes/job.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import backupRoutes from './routes/backup.routes';
import paymentHistoryRoutes from './routes/payment-history.routes';
import reviewRoutes from './routes/review.routes';
import favoriteRoutes from './routes/favorite.routes';
import companyRoutes from './routes/company.routes';
import settingsRoutes from './routes/settings.routes';
import invoiceRoutes from './routes/invoice.routes';
import searchRoutes from './routes/search.routes';
import searchHistoryRoutes from './routes/search-history.routes';
import moderationRoutes from './routes/moderation.routes';
import systemSettingsRoutes from './routes/system-settings.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportsRoutes from './routes/reports.routes';
import onboardingRoutes from './routes/onboarding.routes';
import filesRoutes from './routes/files.routes';
import helpRoutes from './routes/help.routes';
import { getCsrfToken } from './middlewares/csrf.middleware';
import pushRoutes from './routes/push.routes';
import monitoringRoutes from './routes/monitoring.routes';


const app = express();

// Security middleware
app.use(helmet());
app.use(securityHeaders); // Ek güvenlik header'ları
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(xssSanitizer); // XSS koruması - input sanitization
app.use(sqlInjectionDetector); // SQL injection tespiti (loglama)

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments', paymentHistoryRoutes); // Payment history
app.use('/api/admin', adminRoutes);
app.use('/api/admin', backupRoutes); // Backup management
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/admin/moderation', moderationRoutes);
app.use('/api/admin/system-settings', systemSettingsRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/help', helpRoutes);
app.get('/api/csrf-token', getCsrfToken);
app.use('/api/push', pushRoutes);
app.use('/api/admin/monitoring', monitoringRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mimariproje Backend API' });
});

export default app;
