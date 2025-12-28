import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Magic bytes (file signatures) for allowed file types
const MAGIC_BYTES: Record<string, Buffer[]> = {
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8]),
  ],
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  ],
  'image/webp': [
    Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF header, need to check WEBP after
  ],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
  ],
  'application/pdf': [
    Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
  ],
};

// Blocked file extensions (dangerous)
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
  '.msi', '.dll', '.scr', '.pif', '.application', '.gadget',
  '.hta', '.cpl', '.msc', '.com', '.php', '.asp', '.aspx', '.jsp',
];

/**
 * Dosya içeriğinin magic byte'ları ile MIME type uyumunu kontrol eder
 */
function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) {
    // Bilinen bir MIME type değilse, sadece extension kontrolüne güven
    return true;
  }

  // WebP için özel kontrol (RIFF....WEBP formatı)
  if (mimetype === 'image/webp') {
    if (buffer.length < 12) return false;
    const riff = buffer.subarray(0, 4);
    const webp = buffer.subarray(8, 12);
    return riff.equals(Buffer.from([0x52, 0x49, 0x46, 0x46])) &&
           webp.equals(Buffer.from([0x57, 0x45, 0x42, 0x50]));
  }

  // Diğer dosya türleri için magic byte kontrolü
  return signatures.some(sig => {
    if (buffer.length < sig.length) return false;
    return buffer.subarray(0, sig.length).equals(sig);
  });
}

/**
 * Dosya adını güvenli hale getirir (path traversal koruması)
 */
function sanitizeFilename(filename: string): string {
  // Path traversal karakterlerini kaldır
  let safe = filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[<>:"|?*\x00-\x1f]/g, '');
  
  // Sadece son uzantıyı al (çift uzantı saldırısını önle)
  const parts = safe.split('.');
  if (parts.length > 2) {
    safe = `${parts[0]}.${parts[parts.length - 1]}`;
  }
  
  return safe || 'unnamed_file';
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Enhanced file filter with security checks
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // 1. Tehlikeli uzantı kontrolü
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Güvenlik: ${ext} uzantılı dosyalar yüklenemez.`));
  }
  
  // 2. MIME type kontrolü
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Geçersiz dosya türü. Sadece JPEG, PNG, WebP, GIF ve PDF dosyaları kabul edilir.'));
  }
  
  // 3. Dosya uzantısı ve MIME type uyumu kontrolü
  const mimeExtMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'application/pdf': ['.pdf'],
  };
  
  const expectedExts = mimeExtMap[file.mimetype] || [];
  if (!expectedExts.includes(ext)) {
    return cb(new Error(`Dosya uzantısı (${ext}) ve içerik tipi (${file.mimetype}) uyuşmuyor.`));
  }
  
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maksimum 10 dosya
  },
});

/**
 * Yüklenen dosyanın magic byte'larını kontrol eden middleware
 * Multer'dan sonra kullanılmalı
 */
export const validateUploadedFile = async (
  req: any, 
  res: any, 
  next: any
) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    
    for (const file of files) {
      if (!file.path) continue;
      
      // Dosyanın ilk 12 byte'ını oku
      const fd = fs.openSync(file.path, 'r');
      const buffer = Buffer.alloc(12);
      fs.readSync(fd, buffer, 0, 12, 0);
      fs.closeSync(fd);
      
      // Magic byte doğrulaması
      if (!validateMagicBytes(buffer, file.mimetype)) {
        console.warn(`Magic byte mismatch for ${file.mimetype}. Buffer:`, buffer.toString('hex'));
        // Geçersiz dosyayı sil
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          error: 'Güvenlik: Dosya içeriği, belirtilen dosya türüyle uyuşmuyor.',
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('File validation error:', error);
    next(error);
  }
};
