import { prisma } from '../lib/prisma';

export class UserService {
  static async getProfile(userId: number) {
    return prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        user_type: true,
        profession: true,
        phone: true,
        location: true,
        website: true,
        bio: true,
        avatar_url: true,
        specializations: true,
        experience_years: true,
        is_verified: true,
        subscription_type: true,
        created_at: true,
        projects: {
          where: { status: 'active', is_deleted: false },
          take: 6,
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  static async updateProfile(userId: number, data: { 
    bio?: string; 
    location?: string; 
    specializations?: string;
    phone?: string;
    website?: string;
    company_name?: string;
    profession?: string;
  }) {
    return prisma.users.update({
      where: { id: userId },
      data: {
        bio: data.bio,
        location: data.location,
        specializations: data.specializations,
        phone: data.phone,
        website: data.website,
        company_name: data.company_name,
        profession: data.profession,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Kullanıcı profil fotoğrafını güncelle
   */
  static async updateProfileImage(userId: number, avatarUrl: string) {
    return prisma.users.update({
      where: { id: userId },
      data: {
        avatar_url: avatarUrl,
        updated_at: new Date(),
      },
      select: {
        id: true,
        avatar_url: true,
      },
    });
  }

  static async getDashboardStats(userId: number) {
    const [
      activeProjects,
      totalProjects,
      unreadMessages,
    ] = await Promise.all([
      prisma.projects.count({ where: { user_id: userId, status: 'active' } }),
      prisma.projects.count({ where: { user_id: userId } }),
      prisma.messages.count({ 
        where: { 
          conversations: {
            OR: [{ user1_id: userId }, { user2_id: userId }],
          },
          is_read: false,
          NOT: { sender_id: userId }
        } 
      }),
    ]);

    // Get user's average rating from reviews
    const ratingResult = await prisma.$queryRaw<any[]>`
      SELECT AVG(rating) as average, COUNT(*) as count 
      FROM reviews 
      WHERE reviewed_id = ${userId} AND is_visible = true
    `;

    const profileViews = 0; // TODO: Implement view tracking
    const totalEarnings = 0; // TODO: Calculate from escrow transactions

    return {
      profileViews,
      totalProjects,
      totalEarnings,
      activeProjects,
      rating: {
        average: Number(ratingResult[0]?.average || 0).toFixed(1),
        count: Number(ratingResult[0]?.count || 0),
      },
      unreadMessages
    };
  }

  /**
   * Kullanıcıları ara ve filtrele
   */
  static async searchUsers(params: {
    query?: string;
    user_type?: string;
    location?: string;
    profession?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const offset = (page - 1) * limit;

    const where: any = { is_active: true, is_banned: false };

    // Text search - search in name, company, profession, specializations
    if (params.query) {
      where.OR = [
        { first_name: { contains: params.query, mode: 'insensitive' } },
        { last_name: { contains: params.query, mode: 'insensitive' } },
        { company_name: { contains: params.query, mode: 'insensitive' } },
        { profession: { contains: params.query, mode: 'insensitive' } },
        { specializations: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.user_type) {
      where.user_type = params.user_type;
    }
    if (params.location) {
      where.location = { contains: params.location, mode: 'insensitive' };
    }
    if (params.profession) {
      where.profession = { contains: params.profession, mode: 'insensitive' };
    }
    if (params.verified !== undefined) {
      where.is_verified = params.verified;
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          company_name: true,
          user_type: true,
          profession: true,
          location: true,
          avatar_url: true,
          profile_image_url: true,
          specializations: true,
          experience_years: true,
          is_verified: true,
          bio: true,
          created_at: true,
        },
        skip: offset,
        take: limit,
        orderBy: [
          { is_verified: 'desc' }, // Verified users first
          { created_at: 'desc' },
        ],
      }),
      prisma.users.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Kullanıcının public profilini getir
   */
  static async getPublicProfile(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId, is_active: true, is_banned: false },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        company_name: true,
        user_type: true,
        profession: true,
        location: true,
        avatar_url: true,
        profile_image_url: true,
        specializations: true,
        experience_years: true,
        is_verified: true,
        bio: true,
        website: true,
        created_at: true,
        projects: {
          where: { status: 'active', is_deleted: false },
          take: 6,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return user;
  }

  static async getUsers(filters?: { user_type?: string; location?: string; verified?: boolean }, page: number = 1, limit: number = 12) {
    const offset = (page - 1) * limit;
    const where: any = { is_active: true, is_banned: false };

    if (filters?.user_type) {
      where.user_type = filters.user_type;
    }
    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    if (filters?.verified !== undefined) {
      where.is_verified = filters.verified;
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          company_name: true,
          user_type: true,
          profession: true,
          location: true,
          avatar_url: true,
          specializations: true,
          experience_years: true,
          is_verified: true,
          created_at: true,
        },
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.users.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
