import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import path from 'path';
import fs from 'fs';

const router = Router();

// All invoice routes require authentication
router.use(authenticate);

/**
 * GET /api/invoices
 * Kullanıcının faturalarını listele
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const invoices = await prisma.invoices.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        payments: {
          select: {
            id: true,
            payment_type: true,
            status: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { invoices },
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/invoices/:id
 * Fatura detayı
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id);

    const invoice = await prisma.invoices.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
        users: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
            company_name: true,
          },
        },
      },
    });

    if (!invoice || invoice.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Fatura bulunamadı' });
    }

    res.json({
      success: true,
      data: { invoice },
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/invoices/generate/:paymentId
 * Ödeme için fatura oluştur
 */
router.post('/generate/:paymentId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const paymentId = parseInt(req.params.paymentId);

    // Get payment
    const payment = await prisma.payments.findUnique({
      where: { id: paymentId },
      include: {
        users: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
            company_name: true,
            location: true,
          },
        },
      },
    });

    if (!payment || payment.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Ödeme bulunamadı' });
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoices.findFirst({
      where: { payment_id: paymentId },
    });

    if (existingInvoice) {
      return res.json({
        success: true,
        data: { invoice: existingInvoice },
        message: 'Fatura zaten mevcut',
      });
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const count = await prisma.invoices.count({
      where: {
        invoice_number: { startsWith: `INV-${year}` },
      },
    });
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;

    // Calculate tax (KDV 20%)
    const subtotal = Number(payment.amount);
    const taxRate = 0.20;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Create invoice
    const invoice = await prisma.invoices.create({
      data: {
        user_id: userId,
        payment_id: paymentId,
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        due_date: new Date(),
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: payment.currency,
        status: 'paid',
        billing_name: payment.users.company_name || 
          `${payment.users.first_name} ${payment.users.last_name}`,
        billing_email: payment.users.email,
        billing_address: payment.users.location || '',
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: { invoice },
      message: 'Fatura başarıyla oluşturuldu',
    });
  } catch (error: any) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/invoices/:id/download
 * Fatura PDF'ini indir (basit HTML-to-text fatura bilgisi)
 */
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id);

    const invoice = await prisma.invoices.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
        users: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
            company_name: true,
          },
        },
      },
    });

    if (!invoice || invoice.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Fatura bulunamadı' });
    }

    // Generate simple text invoice (PDF generation would require additional library)
    const invoiceText = `
=====================================
              FATURA
=====================================
Fatura No: ${invoice.invoice_number}
Tarih: ${invoice.invoice_date?.toLocaleDateString('tr-TR')}

-------------------------------------
Müşteri Bilgileri:
${invoice.billing_name}
${invoice.billing_email}
${invoice.billing_address || ''}
-------------------------------------

TUTAR DETAYI:
Ara Toplam: ${Number(invoice.subtotal).toLocaleString('tr-TR')} ${invoice.currency}
KDV (%20): ${Number(invoice.tax_amount || 0).toLocaleString('tr-TR')} ${invoice.currency}
-------------------------------------
TOPLAM: ${Number(invoice.total_amount).toLocaleString('tr-TR')} ${invoice.currency}
-------------------------------------

Ödeme Durumu: ${invoice.status === 'paid' ? 'Ödendi' : 'Beklemede'}

=====================================
            Mimariproje.com
     Mimarlık Projeleri Pazaryeri
=====================================
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="fatura-${invoice.invoice_number}.txt"`);
    res.send(invoiceText);
  } catch (error: any) {
    console.error('Download invoice error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
