import { prisma } from '../lib/prisma';

interface CreateJobData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  job_type?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
}

interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  job_type?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  status?: string;
}

export class JobService {
  static async createJob(userId: number, data: CreateJobData) {
    return prisma.jobs.create({
      data: {
        employer_id: userId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        status: 'active',
        category: data.category || 'Genel',
        job_type: data.job_type || 'Tam Zamanlı',
        salary_min: data.salary_min,
        salary_max: data.salary_max,
      },
    });
  }

  static async getJobs(filters?: { location?: string; status?: string; category?: string; job_type?: string; search?: string }) {
    const where: any = {};
    if (filters?.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.job_type) where.job_type = filters.job_type;
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { users: { company_name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    return prisma.jobs.findMany({
      where,
      include: { 
        users: { 
          select: { 
            first_name: true, 
            last_name: true, 
            company_name: true,
            profile_image_url: true
          } 
        },
        _count: {
          select: { job_applications: true }
        }
      },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getJobById(id: number) {
    return prisma.jobs.findUnique({
      where: { id },
      include: { 
        users: { 
          select: { 
            id: true,
            first_name: true, 
            last_name: true, 
            email: true, 
            company_name: true,
            profile_image_url: true,
            location: true
          } 
        },
        _count: {
          select: { job_applications: true }
        }
      },
    });
  }

  static async updateJob(id: number, userId: number, data: UpdateJobData) {
    // Verify ownership
    const job = await prisma.jobs.findUnique({ where: { id } });
    
    if (!job) {
      throw new Error('İş ilanı bulunamadı');
    }

    if (job.employer_id !== userId) {
      throw new Error('Bu ilanı düzenleme yetkiniz yok');
    }

    return prisma.jobs.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      },
    });
  }

  static async deleteJob(id: number, userId: number) {
    // Verify ownership
    const job = await prisma.jobs.findUnique({ where: { id } });
    
    if (!job) {
      throw new Error('İş ilanı bulunamadı');
    }

    if (job.employer_id !== userId) {
      throw new Error('Bu ilanı silme yetkiniz yok');
    }

    await prisma.jobs.delete({ where: { id } });
    
    return { message: 'İş ilanı başarıyla silindi' };
  }

  static async getMyJobs(userId: number) {
    return prisma.jobs.findMany({
      where: { employer_id: userId },
      include: {
        _count: {
          select: { job_applications: true }
        }
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
