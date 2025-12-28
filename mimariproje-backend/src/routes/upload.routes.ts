import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload, validateUploadedFile } from '../config/multer';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all upload routes
router.use(authenticate);

// Profile image upload (single file, optimized)
router.post('/profile-image', upload.single('file'), validateUploadedFile, UploadController.uploadProfileImage);

// Project images upload (multiple files, optimized)
router.post('/project-images', upload.array('files', 10), validateUploadedFile, UploadController.uploadProjectImages);

// Cover image upload (single file, optimized)
router.post('/cover-image', upload.single('file'), validateUploadedFile, UploadController.uploadCoverImage);

// Generic file upload (documents, etc.)
router.post('/file', upload.single('file'), validateUploadedFile, UploadController.uploadFile);

// Message file upload
router.post('/message-file', upload.single('file'), validateUploadedFile, UploadController.uploadFile);

// Delete file
router.delete('/:filename', UploadController.deleteFile);

export default router;

