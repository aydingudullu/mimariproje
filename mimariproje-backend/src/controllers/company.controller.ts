import { Request, Response } from 'express';
import { CompanyService } from '../services/company.service';

export class CompanyController {
  /**
   * Get all companies with filters
   */
  static async getCompanies(req: Request, res: Response) {
    try {
      const {
        search,
        location,
        specialization,
        page = '1',
        limit = '12',
        sortBy = 'rating'
      } = req.query;

      const result = await CompanyService.getCompanies({
        search: search as string,
        location: location as string,
        specialization: specialization as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as 'rating' | 'projects' | 'newest' | 'name',
      });

      res.json(result);
    } catch (error: any) {
      console.error('Get companies error:', error);
      res.status(500).json({ error: 'Firmalar yüklenemedi' });
    }
  }

  /**
   * Get a single company by ID
   */
  static async getCompanyById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Geçersiz firma ID' });
      }

      const company = await CompanyService.getCompanyById(id);
      
      if (!company) {
        return res.status(404).json({ error: 'Firma bulunamadı' });
      }

      res.json({ company });
    } catch (error: any) {
      console.error('Get company error:', error);
      res.status(500).json({ error: 'Firma yüklenemedi' });
    }
  }

  /**
   * Get available locations for filter dropdown
   */
  static async getLocations(req: Request, res: Response) {
    try {
      const locations = await CompanyService.getLocations();
      res.json({ locations });
    } catch (error: any) {
      console.error('Get locations error:', error);
      res.status(500).json({ error: 'Konumlar yüklenemedi' });
    }
  }
}
