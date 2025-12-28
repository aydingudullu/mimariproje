import { Request, Response } from 'express';
import { z } from 'zod';
import { JobApplicationService } from '../services/job-application.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const applyJobSchema = z.object({
  job_id: z.number(),
  cover_letter: z.string().optional(),
  cv_url: z.string().url().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
});

export class JobApplicationController {
  /**
   * Apply for a job
   */
  static async apply(req: AuthRequest, res: Response) {
    try {
      const applicantId = req.user!.id;
      const data = applyJobSchema.parse(req.body);
      
      const result = await JobApplicationService.applyForJob(applicantId, data);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Job application error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get applications for a specific job (employer only)
   */
  static async getJobApplications(req: AuthRequest, res: Response) {
    try {
      const employerId = req.user!.id;
      const jobId = Number(req.params.jobId);
      
      const applications = await JobApplicationService.getJobApplications(jobId, employerId);
      res.json(applications);
    } catch (error: any) {
      console.error('Get job applications error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user's own applications
   */
  static async getMyApplications(req: AuthRequest, res: Response) {
    try {
      const applicantId = req.user!.id;
      
      const applications = await JobApplicationService.getMyApplications(applicantId);
      res.json(applications);
    } catch (error: any) {
      console.error('Get my applications error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single application details
   */
  static async getApplicationById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const applicationId = Number(req.params.id);
      
      const application = await JobApplicationService.getApplicationById(applicationId, userId);
      res.json(application);
    } catch (error: any) {
      console.error('Get application error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update application status (employer only)
   */
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const employerId = req.user!.id;
      const applicationId = Number(req.params.id);
      const { status } = updateStatusSchema.parse(req.body);
      
      const result = await JobApplicationService.updateApplicationStatus(
        applicationId, 
        employerId, 
        status
      );
      res.json(result);
    } catch (error: any) {
      console.error('Update application status error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Withdraw application (applicant only)
   */
  static async withdraw(req: AuthRequest, res: Response) {
    try {
      const applicantId = req.user!.id;
      const applicationId = Number(req.params.id);
      
      const result = await JobApplicationService.withdrawApplication(applicationId, applicantId);
      res.json(result);
    } catch (error: any) {
      console.error('Withdraw application error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
