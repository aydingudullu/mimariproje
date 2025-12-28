import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Dosya yükleme klasörünü ayarla
const uploadDir = path.join(process.cwd(), 'uploads/projects');

// Klasör yoksa oluştur
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  console.log("DEBUG: Middleware fileFilter called for:", file.originalname, file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).array('images', 10);

// Export wrapper middleware
export const uploadProjectImages = (req: any, res: any, next: any) => {
  console.log("DEBUG: Upload Middleware Triggered");
  upload(req, res, (err: any) => {
    if (err) {
      console.error("DEBUG: Multer Error:", err);
      return res.status(400).json({ success: false, error: err.message });
    }
    console.log("DEBUG: Multer processed request");
    next();
  });
};
