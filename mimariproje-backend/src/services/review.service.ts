import { prisma } from '../lib/prisma';

interface CreateReviewData {
  reviewed_id: number;
  project_id?: number;
  rating: number;
  comment?: string;
}

interface ReviewFilters {
  user_id?: number;
  min_rating?: number;
  max_rating?: number;
}

export class ReviewService {
  /**
   * Create a new review
   */
  static async create(reviewerId: number, data: CreateReviewData) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Puan 1 ile 5 arasında olmalıdır');
    }

    // Check if user is trying to review themselves
    if (reviewerId === data.reviewed_id) {
      throw new Error('Kendinizi değerlendiremezsiniz');
    }

    // Check if user has already reviewed this user/project combination
    const existingReview = await prisma.$queryRaw<any[]>`
      SELECT id FROM reviews 
      WHERE reviewer_id = ${reviewerId} 
      AND reviewed_id = ${data.reviewed_id}
      ${data.project_id ? prisma.$queryRaw`AND project_id = ${data.project_id}` : prisma.$queryRaw`AND project_id IS NULL`}
      LIMIT 1
    `;

    if (existingReview && existingReview.length > 0) {
      throw new Error('Bu kullanıcıyı zaten değerlendirdiniz');
    }

    // Create review
    const result = await prisma.$queryRaw<any[]>`
      INSERT INTO reviews (reviewer_id, reviewed_id, project_id, rating, comment, created_at, updated_at)
      VALUES (${reviewerId}, ${data.reviewed_id}, ${data.project_id || null}, ${data.rating}, ${data.comment || null}, NOW(), NOW())
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Get reviews for a user
   */
  static async getByUserId(userId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const reviews = await prisma.$queryRaw<any[]>`
      SELECT r.*, 
             u.first_name as reviewer_first_name, 
             u.last_name as reviewer_last_name,
             u.avatar_url as reviewer_avatar,
             p.title as project_title
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE r.reviewed_id = ${userId} AND r.is_visible = true
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total FROM reviews WHERE reviewed_id = ${userId} AND is_visible = true
    `;

    const total = Number(countResult[0]?.total || 0);

    // Calculate average rating
    const avgResult = await prisma.$queryRaw<any[]>`
      SELECT AVG(rating) as average, COUNT(*) as count 
      FROM reviews 
      WHERE reviewed_id = ${userId} AND is_visible = true
    `;

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        average: Number(avgResult[0]?.average || 0).toFixed(1),
        count: Number(avgResult[0]?.count || 0),
      },
    };
  }

  /**
   * Get a specific review
   */
  static async getById(reviewId: number) {
    const reviews = await prisma.$queryRaw<any[]>`
      SELECT r.*, 
             u1.first_name as reviewer_first_name, 
             u1.last_name as reviewer_last_name,
             u2.first_name as reviewed_first_name,
             u2.last_name as reviewed_last_name
      FROM reviews r
      LEFT JOIN users u1 ON r.reviewer_id = u1.id
      LEFT JOIN users u2 ON r.reviewed_id = u2.id
      WHERE r.id = ${reviewId}
      LIMIT 1
    `;

    if (!reviews || reviews.length === 0) {
      throw new Error('Değerlendirme bulunamadı');
    }

    return reviews[0];
  }

  /**
   * Update a review
   */
  static async update(reviewId: number, reviewerId: number, data: { rating?: number; comment?: string }) {
    // Check ownership
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM reviews WHERE id = ${reviewId} AND reviewer_id = ${reviewerId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      throw new Error('Değerlendirme bulunamadı veya yetkiniz yok');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Puan 1 ile 5 arasında olmalıdır');
    }

    const result = await prisma.$queryRaw<any[]>`
      UPDATE reviews 
      SET rating = COALESCE(${data.rating || null}, rating),
          comment = COALESCE(${data.comment || null}, comment),
          updated_at = NOW()
      WHERE id = ${reviewId}
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Delete a review
   */
  static async delete(reviewId: number, userId: number, isAdmin: boolean = false) {
    // Check ownership or admin
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id, reviewer_id FROM reviews WHERE id = ${reviewId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      throw new Error('Değerlendirme bulunamadı');
    }

    if (!isAdmin && existing[0].reviewer_id !== userId) {
      throw new Error('Bu değerlendirmeyi silme yetkiniz yok');
    }

    await prisma.$executeRaw`DELETE FROM reviews WHERE id = ${reviewId}`;

    return { message: 'Değerlendirme silindi' };
  }

  /**
   * Get user's average rating
   */
  static async getUserRating(userId: number) {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        AVG(rating) as average,
        COUNT(*) as count,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews 
      WHERE reviewed_id = ${userId} AND is_visible = true
    `;

    return {
      average: Number(result[0]?.average || 0).toFixed(1),
      count: Number(result[0]?.count || 0),
      distribution: {
        5: Number(result[0]?.five_star || 0),
        4: Number(result[0]?.four_star || 0),
        3: Number(result[0]?.three_star || 0),
        2: Number(result[0]?.two_star || 0),
        1: Number(result[0]?.one_star || 0),
      },
    };
  }
}
