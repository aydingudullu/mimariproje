import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/admin/analytics/users
 * Kullanıcı analitiği
 */
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total users
    const totalUsers = await prisma.users.count();
    
    // New users in period
    const newUsers = await prisma.users.count({
      where: { created_at: { gte: startDate } },
    });

    // Users by type
    const usersByType = await prisma.users.groupBy({
      by: ['user_type'],
      _count: true,
    });

    // Verified users
    const verifiedUsers = await prisma.users.count({
      where: { is_verified: true },
    });

    // Active users (logged in last 30 days)
    const activeUsers = await prisma.users.count({
      where: { last_login: { gte: startDate } },
    });

    // Banned users
    const bannedUsers = await prisma.users.count({
      where: { is_banned: true },
    });

    // Users by subscription type
    const usersBySubscription = await prisma.users.groupBy({
      by: ['subscription_type'],
      _count: true,
    });

    // Daily signups for chart
    const dailySignups = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    ` as any[];

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          newUsers,
          verifiedUsers,
          activeUsers,
          bannedUsers,
          growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0,
        },
        breakdown: {
          byType: usersByType.map(t => ({ type: t.user_type, count: t._count })),
          bySubscription: usersBySubscription.map(s => ({ type: s.subscription_type, count: s._count })),
        },
        trends: {
          dailySignups: dailySignups.map(d => ({ 
            date: d.date, 
            count: Number(d.count) 
          })),
        },
      },
    });
  } catch (error: any) {
    console.error('User analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/analytics/projects
 * Proje analitiği
 */
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total projects
    const totalProjects = await prisma.projects.count({ where: { is_deleted: false } });
    
    // New projects in period
    const newProjects = await prisma.projects.count({
      where: { created_at: { gte: startDate }, is_deleted: false },
    });

    // Projects by status
    const projectsByStatus = await prisma.projects.groupBy({
      by: ['status'],
      where: { is_deleted: false },
      _count: true,
    });

    // Projects by category
    const projectsByCategory = await prisma.projects.groupBy({
      by: ['category'],
      where: { is_deleted: false, status: 'active' },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 10,
    });

    // Total views
    const viewStats = await prisma.projects.aggregate({
      where: { is_deleted: false },
      _sum: { views: true, likes: true, downloads: true },
    });

    // Featured projects count
    const featuredProjects = await prisma.projects.count({
      where: { featured: true, is_deleted: false },
    });

    // Average price
    const priceStats = await prisma.projects.aggregate({
      where: { is_deleted: false, status: 'active' },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          newProjects,
          featuredProjects,
          totalViews: viewStats._sum.views || 0,
          totalLikes: viewStats._sum.likes || 0,
          totalDownloads: viewStats._sum.downloads || 0,
        },
        pricing: {
          average: Number(priceStats._avg.price) || 0,
          min: Number(priceStats._min.price) || 0,
          max: Number(priceStats._max.price) || 0,
        },
        breakdown: {
          byStatus: projectsByStatus.map(s => ({ status: s.status, count: s._count })),
          byCategory: projectsByCategory.map(c => ({ category: c.category, count: c._count })),
        },
      },
    });
  } catch (error: any) {
    console.error('Project analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/analytics/revenue
 * Gelir analitiği
 */
router.get('/revenue', async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total revenue
    const totalRevenue = await prisma.payments.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
      _count: true,
    });

    // Revenue in period
    const periodRevenue = await prisma.payments.aggregate({
      where: { 
        status: 'completed',
        created_at: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Revenue by payment type
    const revenueByType = await prisma.payments.groupBy({
      by: ['payment_type'],
      where: { status: 'completed' },
      _sum: { amount: true },
      _count: true,
    });

    // Pending payments
    const pendingPayments = await prisma.payments.aggregate({
      where: { status: 'pending' },
      _sum: { amount: true },
      _count: true,
    });

    // Refunded amount
    const refundedAmount = await prisma.payments.aggregate({
      where: { status: 'refunded' },
      _sum: { amount: true },
      _count: true,
    });

    // Active subscriptions
    const activeSubscriptions = await prisma.subscriptions.count({
      where: { status: 'active' },
    });

    // MRR (Monthly Recurring Revenue)
    const mrr = await prisma.subscriptions.aggregate({
      where: { status: 'active' },
      _sum: { monthly_price: true },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Number(totalRevenue._sum.amount) || 0,
          totalTransactions: totalRevenue._count,
          periodRevenue: Number(periodRevenue._sum.amount) || 0,
          periodTransactions: periodRevenue._count,
          pendingAmount: Number(pendingPayments._sum.amount) || 0,
          refundedAmount: Number(refundedAmount._sum.amount) || 0,
        },
        subscriptions: {
          activeCount: activeSubscriptions,
          mrr: Number(mrr._sum.monthly_price) || 0,
          arr: (Number(mrr._sum.monthly_price) || 0) * 12,
        },
        breakdown: {
          byType: revenueByType.map(t => ({
            type: t.payment_type,
            amount: Number(t._sum.amount) || 0,
            count: t._count,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/analytics/jobs
 * İş ilanı analitiği
 */
router.get('/jobs', async (req: AuthRequest, res: Response) => {
  try {
    // Total jobs
    const totalJobs = await prisma.jobs.count();
    
    // Active jobs
    const activeJobs = await prisma.jobs.count({
      where: { status: 'active' },
    });

    // Jobs by category
    const jobsByCategory = await prisma.jobs.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 10,
    });

    // Total applications
    const totalApplications = await prisma.job_applications.count();

    // Applications by status
    const applicationsByStatus = await prisma.job_applications.groupBy({
      by: ['status'],
      _count: true,
    });

    // Average salary range
    const salaryStats = await prisma.jobs.aggregate({
      where: { status: 'active' },
      _avg: { salary_min: true, salary_max: true },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalJobs,
          activeJobs,
          totalApplications,
          avgApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0,
        },
        salary: {
          avgMin: Number(salaryStats._avg.salary_min) || 0,
          avgMax: Number(salaryStats._avg.salary_max) || 0,
        },
        breakdown: {
          byCategory: jobsByCategory.map(c => ({ category: c.category, count: c._count })),
          applicationsByStatus: applicationsByStatus.map(s => ({ 
            status: s.status, 
            count: s._count 
          })),
        },
      },
    });
  } catch (error: any) {
    console.error('Jobs analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/analytics/overview
 * Genel bakış - tüm metrikler
 */
router.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalJobs,
      totalRevenue,
      activeSubscriptions,
      pendingProjects,
      pendingJobs,
    ] = await Promise.all([
      prisma.users.count({ where: { is_active: true } }),
      prisma.projects.count({ where: { is_deleted: false } }),
      prisma.jobs.count(),
      prisma.payments.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      prisma.subscriptions.count({ where: { status: 'active' } }),
      prisma.projects.count({ where: { status: 'pending' } }),
      prisma.jobs.count({ where: { status: 'pending' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalJobs,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        activeSubscriptions,
        pendingModeration: pendingProjects + pendingJobs,
      },
    });
  } catch (error: any) {
    console.error('Overview analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
