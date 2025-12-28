import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: 'webp',
  generateThumbnail: true,
  thumbnailWidth: 300,
};

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

export class UploadService {
  /**
   * Upload and optimize an image file
   */
  static async uploadImage(
    file: Express.Multer.File,
    options: OptimizationOptions = {}
  ): Promise<UploadResult> {
    if (!file) {
      throw new Error('Dosya yüklenmedi');
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };
    const isImage = file.mimetype.startsWith('image/');

    if (!isImage) {
      // Non-image files: just save as-is
      return this.uploadFile(file);
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = opts.format || 'webp';
      const optimizedFilename = `${timestamp}_${randomStr}.${ext}`;
      const optimizedPath = path.join(uploadsDir, optimizedFilename);

      // Process image with sharp
      let sharpInstance = sharp(file.path || file.buffer);
      
      // Get original metadata
      const metadata = await sharpInstance.metadata();

      // Resize if needed (maintaining aspect ratio)
      if (opts.maxWidth || opts.maxHeight) {
        sharpInstance = sharpInstance.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to specified format with quality
      switch (opts.format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: opts.quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: opts.quality });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality: opts.quality });
          break;
        case 'webp':
        default:
          sharpInstance = sharpInstance.webp({ quality: opts.quality });
          break;
      }

      // Save optimized image
      const optimizedInfo = await sharpInstance.toFile(optimizedPath);

      let thumbnailUrl: string | undefined;

      // Generate thumbnail if requested
      if (opts.generateThumbnail) {
        const thumbnailFilename = `thumb_${optimizedFilename}`;
        const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

        await sharp(file.path || file.buffer)
          .resize(opts.thumbnailWidth, opts.thumbnailWidth, {
            fit: 'cover',
            position: 'centre',
          })
          .webp({ quality: 75 })
          .toFile(thumbnailPath);

        thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
      }

      // Delete original uploaded file if it was saved to disk
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        filename: optimizedFilename,
        originalName: file.originalname,
        mimetype: `image/${ext}`,
        size: optimizedInfo.size,
        url: `/uploads/${optimizedFilename}`,
        width: optimizedInfo.width,
        height: optimizedInfo.height,
        thumbnailUrl,
      };
    } catch (error) {
      console.error('Image optimization error:', error);
      // Fallback to regular upload if optimization fails
      return this.uploadFile(file);
    }
  }

  /**
   * Upload a file without optimization (for non-images or fallback)
   */
  static async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new Error('Dosya yüklenmedi');
    }

    const fileUrl = `/uploads/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
    };
  }

  /**
   * Upload profile image with specific optimizations
   */
  static async uploadProfileImage(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, {
      maxWidth: 500,
      maxHeight: 500,
      quality: 90,
      format: 'webp',
      generateThumbnail: true,
      thumbnailWidth: 150,
    });
  }

  /**
   * Upload project image with specific optimizations
   */
  static async uploadProjectImage(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp',
      generateThumbnail: true,
      thumbnailWidth: 400,
    });
  }

  /**
   * Upload cover image (for companies, etc.)
   */
  static async uploadCoverImage(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, {
      maxWidth: 1600,
      maxHeight: 900,
      quality: 85,
      format: 'webp',
      generateThumbnail: false,
    });
  }

  /**
   * Delete a file and its thumbnail
   */
  static async deleteFile(filename: string): Promise<boolean> {
    const filePath = path.join(uploadsDir, filename);
    const thumbnailPath = path.join(thumbnailsDir, `thumb_${filename}`);

    let deleted = false;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }

    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    return deleted;
  }

  /**
   * Get image info
   */
  static async getImageInfo(filepath: string) {
    try {
      const metadata = await sharp(filepath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      return null;
    }
  }
}
