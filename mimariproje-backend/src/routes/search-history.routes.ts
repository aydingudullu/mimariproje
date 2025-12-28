import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// All routes require authentication
router.use(authenticate);

// In-memory storage for search history (in production, use Redis or DB table)
// For now, we'll store in users table as JSON in a metadata field
// Since we don't have a dedicated table, we'll use a simple approach

interface SearchHistoryEntry {
  query: string;
  timestamp: string;
  resultCount?: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  createdAt: string;
}

/**
 * GET /api/search-history
 * Kullanıcının arama geçmişini getir
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get user's search history from notification_preferences (using extra field)
    // In a real app, you'd have a dedicated search_history table
    const prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    let searchHistory: SearchHistoryEntry[] = [];
    if (prefs?.email_notifications) {
      try {
        const data = JSON.parse(prefs.email_notifications);
        if (data.searchHistory) {
          searchHistory = data.searchHistory.slice(0, limit);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }

    res.json({
      success: true,
      data: { searchHistory },
    });
  } catch (error: any) {
    console.error('Get search history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/search-history
 * Arama geçmişine ekle
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { query, resultCount } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, error: 'Geçersiz arama sorgusu' });
    }

    const entry: SearchHistoryEntry = {
      query,
      timestamp: new Date().toISOString(),
      resultCount,
    };

    // Get existing data
    let prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    let existingData: any = {};
    if (prefs?.email_notifications) {
      try {
        existingData = JSON.parse(prefs.email_notifications);
      } catch (e) {
        existingData = {};
      }
    }

    // Add to history (keep last 50)
    const history: SearchHistoryEntry[] = existingData.searchHistory || [];
    
    // Remove duplicate if exists
    const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());
    filtered.unshift(entry);
    const trimmed = filtered.slice(0, 50);

    existingData.searchHistory = trimmed;

    // Upsert preferences
    await prisma.notification_preferences.upsert({
      where: { user_id: userId },
      update: {
        email_notifications: JSON.stringify(existingData),
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        email_notifications: JSON.stringify(existingData),
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Arama geçmişine eklendi',
    });
  } catch (error: any) {
    console.error('Add search history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/search-history
 * Arama geçmişini temizle
 */
router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    if (prefs?.email_notifications) {
      try {
        const existingData = JSON.parse(prefs.email_notifications);
        existingData.searchHistory = [];
        
        await prisma.notification_preferences.update({
          where: { user_id: userId },
          data: {
            email_notifications: JSON.stringify(existingData),
            updated_at: new Date(),
          },
        });
      } catch (e) {
        // Ignore parse errors
      }
    }

    res.json({
      success: true,
      message: 'Arama geçmişi temizlendi',
    });
  } catch (error: any) {
    console.error('Clear search history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/search-history/saved
 * Kaydedilmiş aramaları getir
 */
router.get('/saved', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    let savedSearches: SavedSearch[] = [];
    if (prefs?.push_notifications) {
      try {
        const data = JSON.parse(prefs.push_notifications);
        if (data.savedSearches) {
          savedSearches = data.savedSearches;
        }
      } catch (e) {
        // Not JSON
      }
    }

    res.json({
      success: true,
      data: { savedSearches },
    });
  } catch (error: any) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/search-history/saved
 * Aramayı kaydet
 */
router.post('/saved', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, query, filters } = req.body;

    if (!name || !query) {
      return res.status(400).json({ success: false, error: 'İsim ve sorgu gerekli' });
    }

    const savedSearch: SavedSearch = {
      id: 'ss_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name,
      query,
      filters: filters || {},
      createdAt: new Date().toISOString(),
    };

    // Get existing data
    let prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    let existingData: any = {};
    if (prefs?.push_notifications) {
      try {
        existingData = JSON.parse(prefs.push_notifications);
      } catch (e) {
        existingData = {};
      }
    }

    const savedSearches: SavedSearch[] = existingData.savedSearches || [];
    
    // Max 20 saved searches
    if (savedSearches.length >= 20) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maksimum 20 arama kaydedilebilir' 
      });
    }

    savedSearches.push(savedSearch);
    existingData.savedSearches = savedSearches;

    await prisma.notification_preferences.upsert({
      where: { user_id: userId },
      update: {
        push_notifications: JSON.stringify(existingData),
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        push_notifications: JSON.stringify(existingData),
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: { savedSearch },
      message: 'Arama kaydedildi',
    });
  } catch (error: any) {
    console.error('Save search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/search-history/saved/:id
 * Kaydedilmiş aramayı sil
 */
router.delete('/saved/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const searchId = req.params.id;

    const prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    if (prefs?.push_notifications) {
      try {
        const existingData = JSON.parse(prefs.push_notifications);
        if (existingData.savedSearches) {
          existingData.savedSearches = existingData.savedSearches.filter(
            (s: SavedSearch) => s.id !== searchId
          );
          
          await prisma.notification_preferences.update({
            where: { user_id: userId },
            data: {
              push_notifications: JSON.stringify(existingData),
              updated_at: new Date(),
            },
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    res.json({
      success: true,
      message: 'Kaydedilmiş arama silindi',
    });
  } catch (error: any) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
