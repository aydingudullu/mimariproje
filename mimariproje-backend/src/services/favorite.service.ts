import { prisma } from '../lib/prisma';

export class FavoriteService {
  /**
   * Add a project to favorites
   */
  static async add(userId: number, projectId: number) {
    // Check if project exists
    const project = await prisma.projects.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new Error('Proje bulunamadı');
    }

    // Check if already favorited
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM favorites WHERE user_id = ${userId} AND project_id = ${projectId} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new Error('Bu proje zaten favorilerinizde');
    }

    // Add to favorites
    await prisma.$executeRaw`
      INSERT INTO favorites (user_id, project_id, created_at)
      VALUES (${userId}, ${projectId}, NOW())
    `;

    // Increment likes count on project
    await prisma.projects.update({
      where: { id: projectId },
      data: { likes: { increment: 1 } },
    });

    return { message: 'Favorilere eklendi' };
  }

  /**
   * Remove a project from favorites
   */
  static async remove(userId: number, projectId: number) {
    // Check if favorited
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM favorites WHERE user_id = ${userId} AND project_id = ${projectId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      throw new Error('Bu proje favorilerinizde değil');
    }

    // Remove from favorites
    await prisma.$executeRaw`
      DELETE FROM favorites WHERE user_id = ${userId} AND project_id = ${projectId}
    `;

    // Decrement likes count on project
    await prisma.projects.update({
      where: { id: projectId },
      data: { likes: { decrement: 1 } },
    });

    return { message: 'Favorilerden çıkarıldı' };
  }

  /**
   * Toggle favorite status
   */
  static async toggle(userId: number, projectId: number) {
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM favorites WHERE user_id = ${userId} AND project_id = ${projectId} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return this.remove(userId, projectId);
    } else {
      return this.add(userId, projectId);
    }
  }

  /**
   * Check if a project is favorited
   */
  static async isFavorited(userId: number, projectId: number) {
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM favorites WHERE user_id = ${userId} AND project_id = ${projectId} LIMIT 1
    `;

    return { is_favorited: existing && existing.length > 0 };
  }

  /**
   * Get user's favorites
   */
  static async getUserFavorites(userId: number, page: number = 1, limit: number = 12) {
    const offset = (page - 1) * limit;

    const favorites = await prisma.$queryRaw<any[]>`
      SELECT f.id, f.created_at as favorited_at,
             p.id as project_id, p.title, p.description, p.category, p.price, 
             p.location, p.style, p.status, p.views, p.likes,
             (SELECT image_url FROM project_images pi WHERE pi.project_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image,
             u.id as owner_id, u.first_name as owner_first_name, u.last_name as owner_last_name, u.company_name as owner_company
      FROM favorites f
      JOIN projects p ON f.project_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE f.user_id = ${userId} AND p.is_deleted = false AND p.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total 
      FROM favorites f
      JOIN projects p ON f.project_id = p.id
      WHERE f.user_id = ${userId} AND p.is_deleted = false AND p.status = 'active'
    `;

    const total = Number(countResult[0]?.total || 0);

    return {
      favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get favorite count for a project
   */
  static async getProjectFavoriteCount(projectId: number) {
    const result = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM favorites WHERE project_id = ${projectId}
    `;

    return { count: Number(result[0]?.count || 0) };
  }

  /**
   * Get users who favorited a project
   */
  static async getProjectFavoritedBy(projectId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const users = await prisma.$queryRaw<any[]>`
      SELECT u.id, u.first_name, u.last_name, u.avatar_url, u.company_name, f.created_at as favorited_at
      FROM favorites f
      JOIN users u ON f.user_id = u.id
      WHERE f.project_id = ${projectId}
      ORDER BY f.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total FROM favorites WHERE project_id = ${projectId}
    `;

    const total = Number(countResult[0]?.total || 0);

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
