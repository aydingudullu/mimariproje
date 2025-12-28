import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { prisma } from '../lib/prisma';
import os from 'os';

const router = Router();

// Admin authentication for all monitoring routes
router.use(authenticate);
router.use(isAdmin);

// Store performance metrics (in production, use Redis or time-series DB)
const performanceMetrics: Array<{
  timestamp: Date;
  endpoint: string;
  duration: number;
  statusCode: number;
}> = [];

// Keep last 1000 metrics
const MAX_METRICS = 1000;

/**
 * GET /api/admin/monitoring/health
 * Sistem sağlık durumu
 */
router.get('/health', async (req: AuthRequest, res: Response) => {
  try {
    // Database check
    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - start;
    } catch {
      dbStatus = 'unhealthy';
    }

    // System metrics
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();

    res.json({
      success: true,
      data: {
        status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: Math.floor(uptime),
          formatted: formatUptime(uptime),
        },
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        memory: {
          heapUsed: formatBytes(memUsage.heapUsed),
          heapTotal: formatBytes(memUsage.heapTotal),
          external: formatBytes(memUsage.external),
          rss: formatBytes(memUsage.rss),
        },
        cpu: {
          load1min: cpuLoad[0].toFixed(2),
          load5min: cpuLoad[1].toFixed(2),
          load15min: cpuLoad[2].toFixed(2),
        },
        system: {
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          totalMemory: formatBytes(os.totalmem()),
          freeMemory: formatBytes(os.freemem()),
        },
      },
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/monitoring/performance
 * Performans metrikleri
 */
router.get('/performance', async (req: AuthRequest, res: Response) => {
  try {
    const last = parseInt(req.query.last as string) || 100;
    const metrics = performanceMetrics.slice(-last);

    // Calculate averages
    const avgDuration = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
      : 0;

    // Group by endpoint
    const byEndpoint: Record<string, { count: number; avgDuration: number; errors: number }> = {};
    metrics.forEach(m => {
      if (!byEndpoint[m.endpoint]) {
        byEndpoint[m.endpoint] = { count: 0, avgDuration: 0, errors: 0 };
      }
      byEndpoint[m.endpoint].count++;
      byEndpoint[m.endpoint].avgDuration += m.duration;
      if (m.statusCode >= 400) byEndpoint[m.endpoint].errors++;
    });

    // Calculate averages per endpoint
    Object.keys(byEndpoint).forEach(ep => {
      byEndpoint[ep].avgDuration = Math.round(byEndpoint[ep].avgDuration / byEndpoint[ep].count);
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRequests: metrics.length,
          avgResponseTime: `${avgDuration.toFixed(2)}ms`,
          errorRate: metrics.length > 0
            ? `${((metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100).toFixed(1)}%`
            : '0%',
        },
        byEndpoint,
        recentMetrics: metrics.slice(-20).map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/monitoring/seo
 * SEO analitiği ve özeti
 */
router.get('/seo', async (req: AuthRequest, res: Response) => {
  try {
    // Get project stats for SEO analysis
    const [
      totalProjects,
      projectsWithImages,
      projectsWithDescriptions,
      projectsByCategory,
    ] = await Promise.all([
      prisma.projects.count({ where: { status: 'active', is_deleted: false } }),
      prisma.projects.count({ 
        where: { status: 'active', is_deleted: false  }
        // Note: Would check for images if we had a relation
      }),
      prisma.projects.count({ 
        where: { 
          status: 'active', 
          is_deleted: false,
          NOT: { description: '' },
        } 
      }),
      prisma.projects.groupBy({
        by: ['category'],
        where: { status: 'active', is_deleted: false },
        _count: true,
      }),
    ]);

    // Calculate SEO score
    const hasDescriptionRate = totalProjects > 0 
      ? (projectsWithDescriptions / totalProjects) * 100 
      : 0;

    const seoScore = Math.min(100, Math.round(
      hasDescriptionRate * 0.4 +
      (projectsByCategory.length > 5 ? 30 : projectsByCategory.length * 6) +
      30 // Base score
    ));

    res.json({
      success: true,
      data: {
        score: seoScore,
        grade: seoScore >= 80 ? 'A' : seoScore >= 60 ? 'B' : seoScore >= 40 ? 'C' : 'D',
        metrics: {
          totalIndexablePages: totalProjects + 10, // + static pages
          contentWithDescriptions: `${hasDescriptionRate.toFixed(1)}%`,
          categoryDiversity: projectsByCategory.length,
        },
        recommendations: [
          hasDescriptionRate < 80 && 'Daha fazla projeye açıklama ekleyin',
          projectsByCategory.length < 5 && 'Kategori çeşitliliğini artırın',
        ].filter(Boolean),
        categories: projectsByCategory.map(c => ({
          name: c.category,
          count: c._count,
        })),
      },
    });
  } catch (error: any) {
    console.error('SEO analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/monitoring/metrics
 * Performans metriği kaydet (internal use)
 */
router.post('/metrics', (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, duration, statusCode } = req.body;

    performanceMetrics.push({
      timestamp: new Date(),
      endpoint,
      duration,
      statusCode,
    });

    // Keep only last N metrics
    if (performanceMetrics.length > MAX_METRICS) {
      performanceMetrics.shift();
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  
  return parts.join(' ');
}

export default router;
