import { prisma } from '../lib/prisma';

export class ProjectService {
  static async createProject(userId: number, data: { 
    title: string; 
    description: string; 
    price: number; 
    category: string;
    location?: string;
    area?: string;
    style?: string;
    images?: string[];
  }) {
    return prisma.projects.create({
      data: {
        user_id: userId,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        location: data.location,
        area: data.area,
        style: data.style,
        status: 'published',
        project_images: data.images && data.images.length > 0 ? {
          create: data.images.map((url, index) => ({
            image_url: url,
            is_primary: index === 0,
            order: index
          }))
        } : undefined
      },
    });
  }

  static async getProjects(filters?: { category?: string; location?: string; minPrice?: number; maxPrice?: number }) {
    const where: any = { status: 'published' }; 
    
    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    return prisma.projects.findMany({
      where: { ...where, is_deleted: false },
      include: { 
        users: { select: { first_name: true, last_name: true, email: true, profile_image_url: true, avatar_url: true } },
        project_images: true 
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async getProjectsByUserId(userId: number) {
    return prisma.projects.findMany({
      where: { user_id: userId, is_deleted: false },
      include: { project_images: true },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getProjectById(id: number) {
    return prisma.projects.findUnique({
      where: { id },
      include: { 
        users: { select: { id: true, first_name: true, last_name: true, email: true, avatar_url: true, created_at: true } },
        project_images: true,
      },
    });
  }

  static async updateProject(id: number, userId: number, data: any) {
    const project = await prisma.projects.findUnique({ where: { id } });
    if (!project || project.user_id !== userId) {
      throw new Error('Unauthorized or project not found');
    }

    return prisma.projects.update({
      where: { id },
      data,
    });
  }

  static async deleteProject(id: number, userId: number) {
    const project = await prisma.projects.findUnique({ where: { id } });
    if (!project || project.user_id !== userId) {
      throw new Error('Unauthorized or project not found');
    }

    return prisma.projects.delete({ where: { id } });
  }
}
