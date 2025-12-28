import { Request, Response } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/project.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().nonnegative(),
  category: z.string(),
  location: z.string().optional(),
  area: z.string().optional(),
  style: z.string().optional(),
  specifications: z.any().optional(),
  deliverables: z.array(z.string()).optional(),
  license: z.any().optional(),
  tags: z.array(z.string()).optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.string().optional(),
});

export class ProjectController {
  static async create(req: AuthRequest, res: Response) {
    try {
      console.log("DEBUG: Controller create called");
      console.log("DEBUG: Files received:", (req as any).files ? (req as any).files.length : 'No files');
      console.log("DEBUG: Body keys:", Object.keys(req.body));
      const userId = req.user!.id;
      console.log('Project Create Body:', req.body);
      const data = createProjectSchema.parse(req.body);

      // Handle images
      let imageUrls: string[] = [];
      // Cast req to any to access files property added by multer
      const files = (req as any).files;
      if (files && Array.isArray(files)) {
        imageUrls = files.map((file: any) => `/uploads/projects/${file.filename}`);
      }

      const project = await ProjectService.createProject(userId, { ...data, images: imageUrls });
      res.status(201).json({ success: true, data: { project } });
    } catch (error: any) {
      console.error('Project Create Error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const category = req.query.category as string;
      const location = req.query.location as string;

      const filters = {
        category: category && category !== 'all' ? category : undefined,
        location: location && location !== 'all' ? location : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };
      const projects = await ProjectService.getProjects(filters);
      
      // Transform project_images to images array
      const transformedProjects = projects.map(p => ({
        ...p,
        images: p.project_images ? p.project_images.map((img: any) => img.image_url) : [],
        user: p.users // Map users relation to user field expected by frontend
      }));

      res.json({ success: true, data: { projects: transformedProjects, pagination: { total: projects.length, page: 1, pages: 1 } } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMyProjects(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const projects = await ProjectService.getProjectsByUserId(userId);
      res.json({ success: true, data: { projects } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const project = await ProjectService.getProjectById(Number(req.params.id));
      if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
      res.json({ success: true, data: { project } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = updateProjectSchema.parse(req.body);
      const project = await ProjectService.updateProject(Number(req.params.id), userId, data);
      res.json({ success: true, data: { project } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await ProjectService.deleteProject(Number(req.params.id), userId);
      res.json({ success: true, message: 'Project deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
