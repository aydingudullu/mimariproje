import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

import { uploadProjectImages } from '../middlewares/upload.middleware';

router.post('/', authenticate, uploadProjectImages, ProjectController.create);
router.get('/my', authenticate, ProjectController.getMyProjects);
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getOne);
router.put('/:id', authenticate, ProjectController.update);
router.delete('/:id', authenticate, ProjectController.delete);

export default router;
