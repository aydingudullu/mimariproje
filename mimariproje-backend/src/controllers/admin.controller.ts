import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AdminController {
  // ==================== DASHBOARD ====================

  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Alias for backwards compatibility
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ==================== USER MANAGEMENT ====================

  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, user_type, is_verified, subscription_type } = req.query;
      
      const result = await AdminService.getUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        user_type: user_type as string,
        is_verified: is_verified === 'true' ? true : is_verified === 'false' ? false : undefined,
        subscription_type: subscription_type as string
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await AdminService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error('Get user by id error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { is_verified, subscription_type, user_type } = req.body;
      
      const user = await AdminService.updateUser(userId, {
        is_verified,
        subscription_type,
        user_type
      });
      
      res.json({ message: 'Kullanıcı güncellendi', user });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const result = await AdminService.deleteUser(userId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyUser(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await AdminService.verifyUser(userId);
      res.json({ message: 'Kullanıcı doğrulandı', user });
    } catch (error: any) {
      console.error('Verify user error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== PROJECT MANAGEMENT ====================

  static async getProjects(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, status, category } = req.query;
      
      const result = await AdminService.getProjects({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as string,
        category: category as string
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProjectStatus(req: AuthRequest, res: Response) {
    try {
      const projectId = parseInt(req.params.id);
      const { status } = req.body;
      
      const project = await AdminService.updateProjectStatus(projectId, status);
      res.json({ message: 'Proje durumu güncellendi', project });
    } catch (error: any) {
      console.error('Update project status error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteProject(req: AuthRequest, res: Response) {
    try {
      const projectId = parseInt(req.params.id);
      const result = await AdminService.deleteProject(projectId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete project error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== JOB MANAGEMENT ====================

  static async getJobs(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, status } = req.query;
      
      const result = await AdminService.getJobs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as string
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateJobStatus(req: AuthRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      const { status } = req.body;
      
      const job = await AdminService.updateJobStatus(jobId, status);
      res.json({ message: 'İş ilanı durumu güncellendi', job });
    } catch (error: any) {
      console.error('Update job status error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteJob(req: AuthRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.id);
      const result = await AdminService.deleteJob(jobId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete job error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== ANALYTICS ====================

  static async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { period } = req.query;
      const validPeriods = ['week', 'month', 'year'];
      
      const result = await AdminService.getAnalytics(
        validPeriods.includes(period as string) ? (period as 'week' | 'month' | 'year') : 'month'
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
