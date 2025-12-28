import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(isAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/stats', AdminController.getStats); // Legacy endpoint

// ==================== USER MANAGEMENT ====================
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/verify', AdminController.verifyUser);

// ==================== PROJECT MANAGEMENT ====================
router.get('/projects', AdminController.getProjects);
router.put('/projects/:id/status', AdminController.updateProjectStatus);
router.delete('/projects/:id', AdminController.deleteProject);

// ==================== JOB MANAGEMENT ====================
router.get('/jobs', AdminController.getJobs);
router.put('/jobs/:id/status', AdminController.updateJobStatus);
router.delete('/jobs/:id', AdminController.deleteJob);

// ==================== ANALYTICS ====================
router.get('/analytics', AdminController.getAnalytics);

export default router;
