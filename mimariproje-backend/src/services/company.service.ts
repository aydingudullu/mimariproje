import { prisma } from '../lib/prisma';

interface CompanyFilters {
  search?: string;
  location?: string;
  specialization?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'projects' | 'newest' | 'name';
}

interface CompanyResult {
  id: number;
  company_name: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  avatar_url: string | null;
  specializations: string[];
  experience_years: number | null;
  is_verified: boolean;
  subscription_type: string | null;
  phone: string | null;
  email: string;
  created_at: Date;
  projectCount: number;
  rating: number;
  reviewCount: number;
}

export class CompanyService {
  /**
   * Get all companies (users with user_type = 'company')
   */
  static async getCompanies(filters: CompanyFilters = {}): Promise<{
    companies: CompanyResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const {
      search,
      location,
      specialization,
      page = 1,
      limit = 12,
      sortBy = 'rating'
    } = filters;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      user_type: 'company',
      is_active: true,
      company_name: { not: null },
    };

    if (search) {
      where.OR = [
        { company_name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { specializations: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location && location !== 'Tümü') {
      where.location = location;
    }

    if (specialization) {
      where.specializations = { contains: specialization, mode: 'insensitive' };
    }

    // Get total count
    const total = await prisma.users.count({ where });

    // Get companies with project counts
    const companies = await prisma.users.findMany({
      where,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        location: true,
        website: true,
        bio: true,
        avatar_url: true,
        specializations: true,
        experience_years: true,
        is_verified: true,
        subscription_type: true,
        phone: true,
        created_at: true,
        _count: {
          select: {
            projects: true,
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: this.getOrderBy(sortBy),
    });

    // Transform results
    const transformedCompanies: CompanyResult[] = companies.map(company => ({
      id: company.id,
      company_name: company.company_name || '',
      first_name: company.first_name,
      last_name: company.last_name,
      location: company.location,
      website: company.website,
      bio: company.bio,
      avatar_url: company.avatar_url,
      specializations: company.specializations ? company.specializations.split(',').map(s => s.trim()) : [],
      experience_years: company.experience_years,
      is_verified: company.is_verified || false,
      subscription_type: company.subscription_type,
      phone: company.phone,
      email: company.email,
      created_at: company.created_at || new Date(),
      projectCount: company._count.projects,
      // Mock rating for now - can be calculated from reviews table later
      rating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 100) + 10,
    }));

    return {
      companies: transformedCompanies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single company by ID
   */
  static async getCompanyById(id: number): Promise<CompanyResult | null> {
    const company = await prisma.users.findFirst({
      where: {
        id,
        user_type: 'company',
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        location: true,
        website: true,
        bio: true,
        avatar_url: true,
        specializations: true,
        experience_years: true,
        is_verified: true,
        subscription_type: true,
        phone: true,
        created_at: true,
        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
          },
          take: 6,
        },
        _count: {
          select: {
            projects: true,
          }
        }
      },
    });

    if (!company) return null;

    return {
      id: company.id,
      company_name: company.company_name || '',
      first_name: company.first_name,
      last_name: company.last_name,
      location: company.location,
      website: company.website,
      bio: company.bio,
      avatar_url: company.avatar_url,
      specializations: company.specializations ? company.specializations.split(',').map(s => s.trim()) : [],
      experience_years: company.experience_years,
      is_verified: company.is_verified || false,
      subscription_type: company.subscription_type,
      phone: company.phone,
      email: company.email,
      created_at: company.created_at || new Date(),
      projectCount: company._count.projects,
      rating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 100) + 10,
    };
  }

  /**
   * Get unique locations for filter dropdown
   */
  static async getLocations(): Promise<string[]> {
    const result = await prisma.users.findMany({
      where: {
        user_type: 'company',
        is_active: true,
        location: { not: null },
      },
      select: { location: true },
      distinct: ['location'],
    });

    return result.map(r => r.location!).filter(Boolean);
  }

  private static getOrderBy(sortBy: string): any {
    switch (sortBy) {
      case 'newest':
        return { created_at: 'desc' };
      case 'name':
        return { company_name: 'asc' };
      case 'projects':
        return { projects: { _count: 'desc' } };
      case 'rating':
      default:
        return { is_verified: 'desc' }; // Verified companies first
    }
  }
}
