import { prisma } from '../lib/prisma';
import { EmailService } from './email.service';

interface CreateApplicationData {
  job_id: number;
  cover_letter?: string;
  cv_url?: string;
}

export class JobApplicationService {
  /**
   * Apply for a job
   */
  static async applyForJob(applicantId: number, data: CreateApplicationData) {
    // Check if job exists and is active
    const job = await prisma.jobs.findUnique({
      where: { id: data.job_id },
      include: { users: { select: { id: true, email: true, first_name: true, company_name: true } } }
    });

    if (!job) {
      throw new Error('İş ilanı bulunamadı');
    }

    if (job.status !== 'active') {
      throw new Error('Bu iş ilanı artık aktif değil');
    }

    if (job.employer_id === applicantId) {
      throw new Error('Kendi ilanınıza başvuramazsınız');
    }

    // Check if already applied
    const existingApplication = await prisma.job_applications.findUnique({
      where: {
        job_id_applicant_id: {
          job_id: data.job_id,
          applicant_id: applicantId
        }
      }
    });

    if (existingApplication) {
      throw new Error('Bu ilana zaten başvurdunuz');
    }

    // Create application
    const application = await prisma.job_applications.create({
      data: {
        job_id: data.job_id,
        applicant_id: applicantId,
        cover_letter: data.cover_letter,
        cv_url: data.cv_url,
        status: 'pending',
      },
      include: {
        users: { select: { first_name: true, last_name: true, email: true } },
        jobs: { select: { title: true } }
      }
    });

    // Send notification to employer (TODO: Implement email notification)
    // await EmailService.sendJobApplicationNotification(job.users.email, ...);

    return {
      message: 'Başvurunuz başarıyla gönderildi',
      application
    };
  }

  /**
   * Get applications for a job (employer only)
   */
  static async getJobApplications(jobId: number, employerId: number) {
    // Verify ownership
    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    
    if (!job) {
      throw new Error('İş ilanı bulunamadı');
    }

    if (job.employer_id !== employerId) {
      throw new Error('Bu ilanın başvurularını görüntüleme yetkiniz yok');
    }

    const applications = await prisma.job_applications.findMany({
      where: { job_id: jobId },
      include: {
        users: { 
          select: { 
            id: true,
            first_name: true, 
            last_name: true, 
            email: true,
            profile_image_url: true,
            profession: true,
            bio: true
          } 
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return applications;
  }

  /**
   * Get user's own applications
   */
  static async getMyApplications(applicantId: number) {
    const applications = await prisma.job_applications.findMany({
      where: { applicant_id: applicantId },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            users: {
              select: {
                company_name: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return applications;
  }

  /**
   * Update application status (employer only)
   */
  static async updateApplicationStatus(
    applicationId: number, 
    employerId: number, 
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  ) {
    const application = await prisma.job_applications.findUnique({
      where: { id: applicationId },
      include: { 
        jobs: { select: { employer_id: true, title: true } },
        users: { select: { email: true, first_name: true } }
      }
    });

    if (!application) {
      throw new Error('Başvuru bulunamadı');
    }

    if (application.jobs.employer_id !== employerId) {
      throw new Error('Bu başvuruyu güncelleme yetkiniz yok');
    }

    const updatedApplication = await prisma.job_applications.update({
      where: { id: applicationId },
      data: { status }
    });

    // TODO: Send notification email to applicant about status change
    // await EmailService.sendApplicationStatusUpdate(application.users.email, ...);

    return {
      message: 'Başvuru durumu güncellendi',
      application: updatedApplication
    };
  }

  /**
   * Withdraw application (applicant only)
   */
  static async withdrawApplication(applicationId: number, applicantId: number) {
    const application = await prisma.job_applications.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error('Başvuru bulunamadı');
    }

    if (application.applicant_id !== applicantId) {
      throw new Error('Bu başvuruyu geri çekme yetkiniz yok');
    }

    await prisma.job_applications.delete({
      where: { id: applicationId }
    });

    return { message: 'Başvurunuz geri çekildi' };
  }

  /**
   * Get application details
   */
  static async getApplicationById(applicationId: number, userId: number) {
    const application = await prisma.job_applications.findUnique({
      where: { id: applicationId },
      include: {
        users: { 
          select: { 
            id: true,
            first_name: true, 
            last_name: true, 
            email: true,
            profile_image_url: true,
            profession: true,
            bio: true 
          } 
        },
        jobs: {
          select: {
            id: true,
            title: true,
            employer_id: true,
            users: {
              select: {
                company_name: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new Error('Başvuru bulunamadı');
    }

    // Only employer or applicant can view
    if (application.applicant_id !== userId && application.jobs.employer_id !== userId) {
      throw new Error('Bu başvuruyu görüntüleme yetkiniz yok');
    }

    return application;
  }
}
