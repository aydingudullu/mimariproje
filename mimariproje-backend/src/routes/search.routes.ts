import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/search/suggestions
 * Arama önerileri - projeler ve kullanıcılar
 */
router.get('/suggestions', async (req, res: Response) => {
  try {
    const query = (req.query.q as string || '').trim();
    
    if (query.length < 2) {
      return res.json({
        success: true,
        data: { projects: [], users: [], categories: [] },
      });
    }

    // Search projects
    const projects = await prisma.projects.findMany({
      where: {
        status: 'active',
        is_deleted: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
      },
      take: 5,
      orderBy: { views: 'desc' },
    });

    // Search users (architects/firms)
    const users = await prisma.users.findMany({
      where: {
        is_active: true,
        is_banned: false,
        OR: [
          { first_name: { contains: query, mode: 'insensitive' } },
          { last_name: { contains: query, mode: 'insensitive' } },
          { company_name: { contains: query, mode: 'insensitive' } },
          { profession: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        company_name: true,
        user_type: true,
        profession: true,
        avatar_url: true,
        is_verified: true,
      },
      take: 5,
      orderBy: { is_verified: 'desc' },
    });

    // Get matching categories
    const projectCategories = await prisma.projects.groupBy({
      by: ['category'],
      where: {
        status: 'active',
        is_deleted: false,
        category: { contains: query, mode: 'insensitive' },
      },
      _count: { category: true },
      take: 5,
      orderBy: { _count: { category: 'desc' } },
    });

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: Number(p.price),
          type: 'project',
        })),
        users: users.map(u => ({
          id: u.id,
          name: u.company_name || `${u.first_name} ${u.last_name}`,
          type: u.user_type,
          profession: u.profession,
          avatarUrl: u.avatar_url,
          isVerified: u.is_verified,
          resultType: 'user',
        })),
        categories: projectCategories.map(c => ({
          name: c.category,
          count: c._count.category,
          type: 'category',
        })),
      },
    });
  } catch (error: any) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/search/popular
 * Popüler aramalar ve öne çıkan kategoriler
 */
router.get('/popular', async (req, res: Response) => {
  try {
    // Get popular categories by project count
    const popularCategories = await prisma.projects.groupBy({
      by: ['category'],
      where: { status: 'active', is_deleted: false },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 8,
    });

    // Get most viewed projects
    const trendingProjects = await prisma.projects.findMany({
      where: { status: 'active', is_deleted: false },
      select: {
        id: true,
        title: true,
        category: true,
        views: true,
      },
      orderBy: { views: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        popularCategories: popularCategories.map(c => ({
          name: c.category,
          count: c._count.category,
        })),
        trendingProjects: trendingProjects.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          views: p.views,
        })),
        // Static popular searches (could be dynamic based on analytics)
        popularSearches: [
          'Villa tasarımı',
          'Apartman projesi',
          'İç mekan',
          'Modern mimari',
          'Restorasyon',
        ],
      },
    });
  } catch (error: any) {
    console.error('Popular searches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/search/analytics
 * Arama analitiği (admin)
 */
router.get('/analytics', async (req, res: Response) => {
  try {
    // Get top searched categories (based on category field frequency)
    const topCategories = await prisma.projects.groupBy({
      by: ['category'],
      where: { status: 'active', is_deleted: false },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 10,
    });

    // Get projects with most views
    const mostViewed = await prisma.projects.findMany({
      where: { status: 'active', is_deleted: false },
      select: {
        id: true,
        title: true,
        category: true,
        views: true,
      },
      orderBy: { views: 'desc' },
      take: 10,
    });

    // Get search activity over time (projects viewed per day - approximation)
    const viewStats = await prisma.projects.aggregate({
      where: { status: 'active', is_deleted: false },
      _sum: { views: true },
      _avg: { views: true },
    });

    // Get location-based interests
    const locationInterests = await prisma.users.groupBy({
      by: ['location'],
      where: { 
        is_active: true, 
        is_banned: false,
        location: { not: null },
      },
      _count: true,
      orderBy: { _count: { location: 'desc' } },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        topCategories: topCategories.map(c => ({
          category: c.category,
          count: c._count.category,
        })),
        mostViewed: mostViewed.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          views: p.views,
        })),
        overview: {
          totalViews: viewStats._sum.views || 0,
          avgViewsPerProject: Math.round(Number(viewStats._avg.views) || 0),
        },
        topLocations: locationInterests
          .filter(l => l.location)
          .map(l => ({
            location: l.location,
            userCount: l._count,
          })),
      },
    });
  } catch (error: any) {
    console.error('Search analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
