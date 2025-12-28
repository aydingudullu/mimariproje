import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { JobApplicationController } from '../controllers/job-application.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public job routes
router.get('/', JobController.getAll);
router.get('/:id', JobController.getOne);

// Protected job routes
router.post('/', authenticate, JobController.create);
router.put('/:id', authenticate, JobController.update);
router.delete('/:id', authenticate, JobController.delete);

// Job application routes
router.post('/applications', authenticate, JobApplicationController.apply);
router.get('/applications/my', authenticate, JobApplicationController.getMyApplications);
router.get('/applications/:id', authenticate, JobApplicationController.getApplicationById);
router.put('/applications/:id/status', authenticate, JobApplicationController.updateStatus);
router.delete('/applications/:id', authenticate, JobApplicationController.withdraw);

// Get applications for a specific job (employer only)
router.get('/:jobId/applications', authenticate, JobApplicationController.getJobApplications);

export default router;
