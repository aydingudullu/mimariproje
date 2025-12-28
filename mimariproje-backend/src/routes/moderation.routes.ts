import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/admin/moderation/projects
 * Onay bekleyen projeleri listele
 */
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status === 'pending') {
      where.status = 'pending';
    } else if (status === 'rejected') {
      where.status = 'rejected';
    }

    const [projects, total] = await Promise.all([
      prisma.projects.findMany({
        where,
        include: {
          users: {
            select: { id: true, first_name: true, last_name: true, company_name: true, email: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.projects.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error: any) {
    console.error('Get moderation projects error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/projects/:id/approve
 * Projeyi onayla
 */
router.post('/projects/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await prisma.projects.update({
      where: { id: projectId },
      data: { status: 'active' },
    });

    res.json({
      success: true,
      data: { project },
      message: 'Proje onaylandı',
    });
  } catch (error: any) {
    console.error('Approve project error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/projects/:id/reject
 * Projeyi reddet
 */
router.post('/projects/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const { reason } = req.body;

    const project = await prisma.projects.update({
      where: { id: projectId },
      data: { status: 'rejected' },
    });

    // TODO: Send notification to user about rejection

    res.json({
      success: true,
      data: { project },
      message: 'Proje reddedildi',
    });
  } catch (error: any) {
    console.error('Reject project error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/moderation/jobs
 * Onay bekleyen iş ilanlarını listele
 */
router.get('/jobs', async (req: AuthRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status === 'pending') {
      where.status = 'pending';
    } else if (status === 'rejected') {
      where.status = 'rejected';
    }

    const [jobs, total] = await Promise.all([
      prisma.jobs.findMany({
        where,
        include: {
          users: {
            select: { id: true, first_name: true, last_name: true, company_name: true, email: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.jobs.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error: any) {
    console.error('Get moderation jobs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/jobs/:id/approve
 */
router.post('/jobs/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = parseInt(req.params.id);

    const job = await prisma.jobs.update({
      where: { id: jobId },
      data: { status: 'active' },
    });

    res.json({
      success: true,
      data: { job },
      message: 'İş ilanı onaylandı',
    });
  } catch (error: any) {
    console.error('Approve job error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/jobs/:id/reject
 */
router.post('/jobs/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = parseInt(req.params.id);

    const job = await prisma.jobs.update({
      where: { id: jobId },
      data: { status: 'rejected' },
    });

    res.json({
      success: true,
      data: { job },
      message: 'İş ilanı reddedildi',
    });
  } catch (error: any) {
    console.error('Reject job error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/moderation/stats
 * Moderasyon istatistikleri
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [
      pendingProjects,
      pendingJobs,
      rejectedProjects,
      rejectedJobs,
    ] = await Promise.all([
      prisma.projects.count({ where: { status: 'pending' } }),
      prisma.jobs.count({ where: { status: 'pending' } }),
      prisma.projects.count({ where: { status: 'rejected' } }),
      prisma.jobs.count({ where: { status: 'rejected' } }),
    ]);

    res.json({
      success: true,
      data: {
        pendingProjects,
        pendingJobs,
        rejectedProjects,
        rejectedJobs,
        totalPending: pendingProjects + pendingJobs,
      },
    });
  } catch (error: any) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
