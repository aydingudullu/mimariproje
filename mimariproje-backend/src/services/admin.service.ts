import { prisma } from '../lib/prisma';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface UserFilters extends PaginationParams {
  search?: string;
  user_type?: string;
  is_verified?: boolean;
  subscription_type?: string;
}

interface ProjectFilters extends PaginationParams {
  search?: string;
  status?: string;
  category?: string;
}

interface JobFilters extends PaginationParams {
  search?: string;
  status?: string;
}

export class AdminService {
  // ==================== DASHBOARD STATS ====================
  
  static async getDashboardStats() {
    const [
      totalUsers,
      verifiedUsers,
      totalProjects,
      totalJobs,
      activeJobs,
      totalApplications,
      totalConversations,
      recentUsers,
      recentProjects
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { is_verified: true } }),
      prisma.projects.count(),
      prisma.jobs.count(),
      prisma.jobs.count({ where: { status: 'active' } }),
      prisma.job_applications.count(),
      prisma.conversations.count(),
      prisma.users.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: { id: true, email: true, first_name: true, last_name: true, created_at: true, user_type: true }
      }),
      prisma.projects.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: { id: true, title: true, created_at: true, status: true }
      })
    ]);

    // Weekly stats
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersThisWeek, newProjectsThisWeek] = await Promise.all([
      prisma.users.count({ where: { created_at: { gte: oneWeekAgo } } }),
      prisma.projects.count({ where: { created_at: { gte: oneWeekAgo } } })
    ]);

    return {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        newThisWeek: newUsersThisWeek
      },
      projects: {
        total: totalProjects,
        newThisWeek: newProjectsThisWeek
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        applications: totalApplications
      },
      conversations: totalConversations,
      recent: {
        users: recentUsers,
        projects: recentProjects
      }
    };
  }

  // ==================== USER MANAGEMENT ====================

  static async getUsers(filters: UserFilters = {}) {
    const { page = 1, limit = 20, search, user_type, is_verified, subscription_type } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { company_name: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (user_type) where.user_type = user_type;
    if (is_verified !== undefined) where.is_verified = is_verified;
    if (subscription_type) where.subscription_type = subscription_type;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          company_name: true,
          user_type: true,
          is_verified: true,
          subscription_type: true,
          created_at: true,
          profile_image_url: true,
          _count: {
            select: { projects: true }
          }
        }
      }),
      prisma.users.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getUserById(id: number) {
    return prisma.users.findUnique({
      where: { id },
      include: {
        projects: { take: 5, orderBy: { created_at: 'desc' } },
        jobs: { take: 5, orderBy: { created_at: 'desc' } },
        _count: {
          select: { projects: true, jobs: true, job_applications: true }
        }
      }
    });
  }

  static async updateUser(id: number, data: {
    is_verified?: boolean;
    subscription_type?: string;
    user_type?: string;
  }) {
    return prisma.users.update({
      where: { id },
      data: { ...data, updated_at: new Date() }
    });
  }

  static async deleteUser(id: number) {
    await prisma.users.delete({ where: { id } });
    return { message: 'Kullanıcı silindi' };
  }

  static async verifyUser(id: number) {
    return prisma.users.update({
      where: { id },
      data: { is_verified: true, updated_at: new Date() }
    });
  }

  // ==================== PROJECT MANAGEMENT ====================

  static async getProjects(filters: ProjectFilters = {}) {
    const { page = 1, limit = 20, search, status, category } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;

    const [projects, total] = await Promise.all([
      prisma.projects.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: { id: true, first_name: true, last_name: true, company_name: true }
          }
        }
      }),
      prisma.projects.count({ where })
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateProjectStatus(id: number, status: string) {
    return prisma.projects.update({
      where: { id },
      data: { status, updated_at: new Date() }
    });
  }

  static async deleteProject(id: number) {
    await prisma.projects.delete({ where: { id } });
    return { message: 'Proje silindi' };
  }

  // ==================== JOB MANAGEMENT ====================

  static async getJobs(filters: JobFilters = {}) {
    const { page = 1, limit = 20, search, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.jobs.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: { id: true, first_name: true, last_name: true, company_name: true }
          },
          _count: {
            select: { job_applications: true }
          }
        }
      }),
      prisma.jobs.count({ where })
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateJobStatus(id: number, status: string) {
    return prisma.jobs.update({
      where: { id },
      data: { status, updated_at: new Date() }
    });
  }

  static async deleteJob(id: number) {
    await prisma.jobs.delete({ where: { id } });
    return { message: 'İş ilanı silindi' };
  }

  // ==================== ANALYTICS ====================

  static async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const [usersByType, projectsByCategory, jobsByStatus] = await Promise.all([
      prisma.users.groupBy({
        by: ['user_type'],
        _count: { id: true }
      }),
      prisma.projects.groupBy({
        by: ['category'],
        _count: { id: true }
      }),
      prisma.jobs.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    return {
      period,
      startDate,
      endDate: now,
      usersByType: usersByType.map(u => ({ type: u.user_type, count: u._count.id })),
      projectsByCategory: projectsByCategory.map(p => ({ category: p.category, count: p._count.id })),
      jobsByStatus: jobsByStatus.map(j => ({ status: j.status, count: j._count.id }))
    };
  }
}
