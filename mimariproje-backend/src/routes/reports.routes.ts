import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/admin/reports/users
 * Kullanıcı raporu oluştur
 */
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const format = req.query.format as string || 'json';

    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        user_type: true,
        subscription_type: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        last_login: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (format === 'csv') {
      const csv = generateCsv(users, [
        'id', 'email', 'first_name', 'last_name', 'company_name',
        'user_type', 'subscription_type', 'is_verified', 'is_active',
        'created_at', 'last_login'
      ]);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      data: { users, total: users.length },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Users report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/reports/projects
 * Proje raporu oluştur
 */
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const format = req.query.format as string || 'json';

    const projects = await prisma.projects.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        price: true,
        views: true,
        likes: true,
        downloads: true,
        created_at: true,
        users: {
          select: { first_name: true, last_name: true, company_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const flatProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      status: p.status,
      price: Number(p.price),
      views: p.views,
      likes: p.likes,
      downloads: p.downloads,
      created_at: p.created_at,
      owner_name: p.users?.company_name || `${p.users?.first_name} ${p.users?.last_name}`,
      owner_email: p.users?.email,
    }));

    if (format === 'csv') {
      const csv = generateCsv(flatProjects, [
        'id', 'title', 'category', 'status', 'price', 'views',
        'likes', 'downloads', 'created_at', 'owner_name', 'owner_email'
      ]);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="projects_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      data: { projects: flatProjects, total: flatProjects.length },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Projects report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/reports/payments
 * Ödeme raporu oluştur
 */
router.get('/payments', async (req: AuthRequest, res: Response) => {
  try {
    const format = req.query.format as string || 'json';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const where: any = {};
    if (startDate) where.created_at = { gte: startDate };
    if (endDate) where.created_at = { ...where.created_at, lte: endDate };

    const payments = await prisma.payments.findMany({
      where,
      include: {
        users: {
          select: { first_name: true, last_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const flatPayments = payments.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      payment_type: p.payment_type,
      status: p.status,
      created_at: p.created_at,
      user_name: `${p.users?.first_name} ${p.users?.last_name}`,
      user_email: p.users?.email,
    }));

    // Summary
    const summary = {
      totalAmount: flatPayments.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: flatPayments.length,
      completed: flatPayments.filter(p => p.status === 'completed').length,
      pending: flatPayments.filter(p => p.status === 'pending').length,
      failed: flatPayments.filter(p => p.status === 'failed').length,
    };

    if (format === 'csv') {
      const csv = generateCsv(flatPayments, [
        'id', 'amount', 'currency', 'payment_type', 'status',
        'created_at', 'user_name', 'user_email'
      ]);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="payments_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      data: { payments: flatPayments, summary },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Payments report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/reports/jobs
 * İş ilanı raporu
 */
router.get('/jobs', async (req: AuthRequest, res: Response) => {
  try {
    const format = req.query.format as string || 'json';

    const jobs = await prisma.jobs.findMany({
      include: {
        users: {
          select: { first_name: true, last_name: true, company_name: true, email: true },
        },
        _count: {
          select: { job_applications: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const flatJobs = jobs.map(j => ({
      id: j.id,
      title: j.title,
      category: j.category,
      job_type: j.job_type,
      status: j.status,
      salary_min: Number(j.salary_min),
      salary_max: Number(j.salary_max),
      applications_count: j._count.job_applications,
      created_at: j.created_at,
      poster_name: j.users?.company_name || `${j.users?.first_name} ${j.users?.last_name}`,
      poster_email: j.users?.email,
    }));

    if (format === 'csv') {
      const csv = generateCsv(flatJobs, [
        'id', 'title', 'category', 'job_type', 'status',
        'salary_min', 'salary_max', 'applications_count',
        'created_at', 'poster_name', 'poster_email'
      ]);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="jobs_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      data: { jobs: flatJobs, total: flatJobs.length },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Jobs report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to generate CSV
function generateCsv(data: any[], columns: string[]): string {
  if (data.length === 0) return columns.join(',') + '\n';

  const header = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      }
      if (value instanceof Date) return value.toISOString();
      return String(value);
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

export default router;
