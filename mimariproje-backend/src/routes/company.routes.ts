import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';

const router = Router();

// Public routes - no auth required
router.get('/', CompanyController.getCompanies);
router.get('/locations', CompanyController.getLocations);
router.get('/:id', CompanyController.getCompanyById);

export default router;
