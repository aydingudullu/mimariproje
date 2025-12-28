import { Request, Response } from 'express';
import { z } from 'zod';
import { JobService } from '../services/job.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const createJobSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  requirements: z.string().min(10, 'Gereksinimler en az 10 karakter olmalıdır'),
  location: z.string().min(2, 'Konum gereklidir'),
  job_type: z.string().optional(),
  category: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
});

const updateJobSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  requirements: z.string().min(10).optional(),
  location: z.string().min(2).optional(),
  job_type: z.string().optional(),
  category: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  status: z.enum(['active', 'closed', 'draft']).optional(),
});

export class JobController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = createJobSchema.parse(req.body);
      const job = await JobService.createJob(userId, data);
      res.status(201).json(job);
    } catch (error: any) {
      console.error('Create job error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const filters = {
        location: req.query.location as string,
        status: req.query.status as string,
        category: req.query.category as string,
        job_type: req.query.job_type as string,
        search: req.query.search as string,
      };
      const jobs = await JobService.getJobs(filters);
      res.json(jobs);
    } catch (error: any) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const job = await JobService.getJobById(Number(req.params.id));
      if (!job) return res.status(404).json({ error: 'İş ilanı bulunamadı' });
      res.json(job);
    } catch (error: any) {
      console.error('Get job error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const jobId = Number(req.params.id);
      const data = updateJobSchema.parse(req.body);
      
      const job = await JobService.updateJob(jobId, userId, data);
      res.json(job);
    } catch (error: any) {
      console.error('Update job error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const jobId = Number(req.params.id);
      
      const result = await JobService.deleteJob(jobId, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete job error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getMyJobs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const jobs = await JobService.getMyJobs(userId);
      res.json(jobs);
    } catch (error: any) {
      console.error('Get my jobs error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
